import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useQuery } from 'react-query';
import API from '../utils/API.js';
import { getEntityLabelConfig, invertEntityList } from '../utils/helpers.js';

async function adHocSearch({ id, level, newAdHocSearchCriteria }) {
  const response = await API.post(
    `adhocExtraction/${level}/${id}`,
    newAdHocSearchCriteria,
    {
      headers: {
        'Content-type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
  return response.data;
}
export default function useAdHocSearch(
  id,
  level,
  adHocSearchCriteria,
  workspaceContext,
  fieldFilter
) {
  // nosonar
  const { groupByFile, searchType } = adHocSearchCriteria || {};

  // Replace any | with %7C
  var newAdHocSearchCriteria = _.cloneDeep(adHocSearchCriteria) || {};
  const criteria = [];
  newAdHocSearchCriteria?.criterias?.forEach(criterion => {
    if (criterion.question) {
      criterion['question'] = criterion.question.replace('|', '%7C');
    }
    criteria.push(criterion);
  });
  newAdHocSearchCriteria.criterias = criteria;
  if (newAdHocSearchCriteria.question) {
    newAdHocSearchCriteria['question'] =
      newAdHocSearchCriteria.question.replace('|', '%7C');
  }
  if (fieldFilter) {
    newAdHocSearchCriteria.fieldFilter = fieldFilter;
  }

  const { data, error, isLoading, isError, refetch } = useQuery(
    ['adhoc-search', id, level, newAdHocSearchCriteria],
    () => adHocSearch({ id, level, newAdHocSearchCriteria }),
    {
      enabled: false,
    }
  );

  if (isError) {
    throw error;
  }

  useEffect(() => {
    if (!data || isLoading) {
      return;
    }
    let totalCount = 0;
    let searchResults = {};
    let outputs = [];
    if (!groupByFile) {
      outputs = data.outputs;
    } else {
      outputs = level === 'workspace' ? data.outputs : [data];
    }

    console.log('outputs received from server: ', level, data);

    let entityTypes = Object.keys(getEntityLabelConfig(workspaceContext));
    let resultFacts = outputs.reduce((acc, file, idx) => {
      if (!file[0]['topic_facts'].length) {
        return acc;
      }
      totalCount += file[0]['topic_facts'].length;
      for (let topicFact of file[0]['topic_facts']) {
        if (topicFact.entity_list) {
          topicFact.entity_tags = invertEntityList(
            entityTypes,
            topicFact.entity_list
          );
        }
      }
      acc.push({
        fileIdx: file[0]['file_idx'],
        fileName: file[0]['file_name'],
        fileMeta: file[0]['file_meta'],
        topicFacts: file[0]['topic_facts'],
        criterias: file[0]['criterias'],
        expectedAnswerType: file[0]['expected_answer_type'],
      });
      if (data.grid) {
        data.grid[1][idx]['Ad hoc']['topic_facts'] = file[0]['topic_facts'];
      }
      return acc;
    }, []);

    if (searchType === 'relation-triple' || searchType === 'relation-node') {
      searchResults = {
        totalCount,
        empty: totalCount === 0,
        tmpFileFacts: [],
        fileFacts: resultFacts,
        pagination: data.pagination
          ? data.pagination
          : [
              {
                workspace: {
                  offset: 0,
                  result_per_page: workspaceContext.searchCriteriaDocPerPage,
                  total: 0,
                },
              },
            ],
        preProcessors: {},
      };
      workspaceContext.setRelationSearchResults(searchResults);
    } else if (level === 'workspace') {
      searchResults = {
        grid: data.grid ? data.grid : [[], []],
        totalCount,
        empty: totalCount === 0,
        tmpFileFacts: [],
        fileFacts: resultFacts,
        pagination: data.pagination
          ? data.pagination
          : [
              {
                workspace: {
                  offset: 0,
                  result_per_page: workspaceContext.searchCriteriaDocPerPage,
                  total: 0,
                },
              },
            ],
        preProcessors: data.aggregate_post_processors
          ? data.aggregate_post_processors['Ad hoc']
          : {},
      };
      workspaceContext.setSearchResults(searchResults);
    } else {
      let docSearchResults = {
        empty: resultFacts.length == 0,
        results: resultFacts,
      };
      workspaceContext.setDocSearchResults(docSearchResults);
    }
  }, [data, isLoading, groupByFile, searchType, level]);

  const runAdHocSearch = useCallback(() => {
    setTimeout(() => refetch());
  }, [refetch]);

  return {
    runAdHocSearch,
    isLoading,
  };
}
