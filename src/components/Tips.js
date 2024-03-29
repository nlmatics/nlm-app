import { Typography, List, Alert } from 'antd';
import { groupDescriptions } from '../utils/constants';
// import fileData from './../test-data/sample-file.json';

const { Paragraph } = Typography;
const { Text } = Typography;

const groupItems = [
  {
    title: groupDescriptions['same_answer'],
    description:
      'When the same answer is found in different places in a document, the answers are grouped into a single answer with a list showing each section the answer was found in.',
  },
  {
    title: groupDescriptions['similar_answer'],
    description:
      'When different but semantically similar (not same) answers for a question are found in different places in a document, the answers are grouped together with a list showing each answer.',
  },
  {
    title: groupDescriptions['same_location'],
    description:
      'When multiple answers are found in the same paragraph, they are grouped together to make it easier to read.',
  },
  {
    title: groupDescriptions['list_item'],
    description:
      'When your question matches a list, answers from items in the list are grouped together.',
  },
];
export const questionTips = {
  general: (
    <>
      <p>
        <strong>When</strong> is the payment due
      </p>
      <p>
        <strong>Where</strong> is the office located
      </p>
      <p>
        <strong>Who</strong> is the officer
      </p>
      <p>
        <strong>How</strong> do the wipers work
      </p>
      <p>
        <strong>How much</strong> does it cost
      </p>
      <p>
        <strong>Is</strong> there a wait time
      </p>
    </>
  ),
  biomedical: (
    <>
      <p>
        What <strong>inhibits</strong> the MAPK pathway
      </p>
      <p>
        Which genes are <strong>expressed</strong> in breast cancer
      </p>
      <p>
        <strong>How many</strong> patients were studied
      </p>
      <p>
        What is <strong>upregulated</strong> in gastric cancer
      </p>
      <p>
        <strong>How does</strong> paclitaxel work
      </p>
      <p>
        <strong>Does</strong> lung cancer metastasize to liver
      </p>
    </>
  ),
};

export const keywordsTips = {
  general: (
    <>
      {' '}
      <p>payment date</p>
      <p>company name</p>
      <p>office location</p>
      <p>price target</p>
      <p>balance sheet debt</p>
      <p>executive summary</p>
    </>
  ),
  biomedical: (
    <>
      {' '}
      <p>breast cancer MAPK</p>
      <p>sox7 h23</p>
      <p>breast cancer chemoresistance</p>
      <p>lung cancer metastasis</p>
      <p>pancreatic cancer mutations</p>
      <p>p53 HOXC8 overexpression</p>
    </>
  ),
};
export const searchTips = {
  relation: {
    placeHolderText: 'Describe relation in natural language e.g. part of',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          <Text strong>Describe relation</Text> in natural language.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>part of</Text> will extract any relation
          semantically similar to part of.
        </Paragraph>
        <Paragraph>
          Any short phrase describing the relationship should be good. When
          types of entities are entered, the search looks for e.g.{' '}
          <Text strong>Entity 1</Text>
          <Text italic>your relation phrase</Text>
          <Text strong>Entity 2</Text>
        </Paragraph>
        <Paragraph>
          <Text strong>Note: </Text>All your queries can be in lower case.
        </Paragraph>
      </div>
    ),
  },
  node: {
    placeHolderText:
      'Ask a question to extract node value from matching passages',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          <Text strong>Ask a question </Text> in natural language.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>what is the pathway name </Text> will retrieve name
          of pathway from passages having pathway names.
        </Paragraph>
        <Paragraph>
          <Text strong>Note: </Text>All your queries can be in lower case.
        </Paragraph>
      </div>
    ),
  },
  sourceQuestion: {
    placeHolderText: 'Ask a question to extract source (head) of the relation',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          <Text strong>Ask a question </Text> in natural language.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>what is the pathway name </Text> will retrieve name
          of pathway from passages having pathway names.
        </Paragraph>
        <Paragraph>
          <Text strong>Note: </Text>All your queries can be in lower case.
        </Paragraph>
      </div>
    ),
  },
  targetQuestion: {
    placeHolderText: 'Ask a question to extract target (tail) of the relation',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          <Text strong>Ask a question </Text> in natural language.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>what activates the pathway </Text> will retrieve
          name of what activates a pathway.
        </Paragraph>
        <Paragraph>
          <Text strong>Note: </Text>All your queries can be in lower case.
        </Paragraph>
      </div>
    ),
  },
  sourceEntity: {
    placeHolderText: 'Select an entity type',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>Select the source entity of the relation.</Paragraph>
        <Paragraph>
          In a [<Text strong>person</Text>, <Text italic>employed with</Text>,{' '}
          <Text strong>company</Text> relation], person will be the target
          entity type.
        </Paragraph>
      </div>
    ),
  },
  targetEntity: {
    placeHolderText: 'Select an entity type',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>Select the target entity of the relation.</Paragraph>
        <Paragraph>
          In a [<Text strong>person</Text>, <Text italic>employed with</Text>,{' '}
          <Text strong>company</Text> relation], company will be the target
          entity type.
        </Paragraph>
      </div>
    ),
  },
  entities: {
    placeHolderText: 'Select one or more concepts',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Passages selected by search must have concepts mentioned
        </Paragraph>
        <Paragraph>
          e.g. if you select &quot;person&quot; and &quot;organization&quot;
          only passages having a person <Text strong>and</Text> organization
          will be selected
        </Paragraph>
        <Paragraph>
          e.g. if you select &quot;gene&quot; and &quot;disease&quot; only
          passages having a gene <Text strong>and</Text> disease will be
          selected
        </Paragraph>
      </div>
    ),
  },
  question: {
    placeHolderText:
      'Ask a question to extract answers or enter keywords for intelligent search',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          <Text strong>Ask a question</Text> to extract answers simultaneously
          from all your files. Answers extracted using questions can be{' '}
          <Text strong>saved as a search data field</Text>.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>How much is the insurance premium</Text> will
          extract insurance premium from all the documents in the workspace.
        </Paragraph>
        <Paragraph>
          <Text strong>Enter keywords</Text> to run intelligent keyword search
          on all documents in the workspace. Our algorithms also look for words
          similar to your keywords and search within specific sections.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>insurance premium</Text> will extract all passages
          in your document matching insurance premium.
        </Paragraph>
        <Paragraph>
          <Text strong>Note: </Text>All your queries can be in lower case and do
          not need a ? at the end.
        </Paragraph>
      </div>
    ),
  },
  keywords: {
    placeHolderText:
      'Passages must have any of the entered keywords or phrases',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Passages <Text strong>must have</Text> the keywords or phrases entered
          here. You can enter one or more keywords or phrases.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>target</Text>, <Text italic>price</Text> (entered
          separately) will restrict search to passages containing{' '}
          <Text italic>either</Text> target or price.
        </Paragraph>
        <Paragraph>
          However <Text italic>target price</Text> (entered together as a
          phrase) will restrict search to passages containing{' '}
          <Text italic>both</Text> target and price.
        </Paragraph>
        <Paragraph>
          <Text italic>target price</Text>, <Text italic>estimate</Text> (a
          phrase and a word) will restrict search to passages containing either{' '}
          <Text italic>target price</Text> or <Text italic>estimate</Text>.
        </Paragraph>
      </div>
    ),
  },
  headings: {
    placeHolderText: 'Search within any of the entered headings',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Search engine to prioritizes to look within any of entered headings.
          When one or more headings are entered, matches within any of the
          entered headings are used for answering questions.
        </Paragraph>
        <Paragraph>
          If only heading is selected without any query, search will return all
          lines from the section.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>use of proceeds</Text> will first search within
          section/heading named use of proceeds.
        </Paragraph>
        <Paragraph>
          To find right headings to search under, see the heading information on
          a search card, or switch to file&apos;s outline view to see all the
          headings or sections in the file.
        </Paragraph>
      </div>
    ),
  },
  scope: {
    placeHolderText: 'Page range to search within',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Enter page range to search within and # of sentences to include before
          and after match.
        </Paragraph>
      </div>
    ),
  },
  tables: {
    placeHolderText: 'Enable tables',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Matches your query with table column headings and row descriptions to
          extract table rows, columns, and cells as answers.
        </Paragraph>
      </div>
    ),
  },
  group: {
    placeHolderText: 'Enable groups',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          When grouping option is enabled, instead of showing separate answer
          cards, related answers are grouped together.
        </Paragraph>
        <Paragraph>The different types of grouping are as follows:</Paragraph>
        <List
          itemLayout="horizontal"
          dataSource={groupItems}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    ),
  },
  answerType: {
    placeHolderText: 'Standardize answers into customizable phrases',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>Look for passages that contain the selected type.</Paragraph>
        <Paragraph>
          <ul>
            <li>
              e.g. if you specify <Text strong>money</Text> passages having
              money will be ranked higher
            </li>
            <li>
              select <Text strong>auto</Text> to let nlmatics automatically
              infer answer type from your question
            </li>
            <li>
              select <Text strong>disable</Text> to disable this feature i.e.
              search for passages will not be limited to a certain type
            </li>
          </ul>
        </Paragraph>
      </div>
    ),
  },
  formatAnswer: {
    placeHolderText: 'Standardize answers into customizable phrases',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Standardize answers into by picking the best option from a list of
          predefined phrases.
        </Paragraph>
        <Paragraph>
          e.g. if you specify <Text strong>stock, bond </Text> as options:
        </Paragraph>
        <Paragraph>
          <ul>
            <li>
              shares, stock, common stock etc. will be have answer{' '}
              <Text italic>stock</Text>
            </li>
            <li>
              convertible bonds, exchangeable notes etc. will have answer{' '}
              <Text italic>bond</Text>
            </li>
          </ul>
        </Paragraph>
      </div>
    ),
  },
  extractNames: {
    placeHolderText: 'e.g law firms, financial services',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>
          Extract Names and Role criteria are designed to work in conjunction.
          Together they can be used to extract desired entity types and their
          roles from passages matching your search criteria.
        </Paragraph>
        <Paragraph>
          Search terms entered in extract names will be used to look for
          matching entities in passages returned by search. e.g.{' '}
          <Text italic>law firm</Text> will find names of law firms.
        </Paragraph>
        <Paragraph>
          Extraction pattern entered in role will extract role the entity plays
          e.g. <Text italic>$ENTITY will </Text> extracts what the entity will
          do from a matching passage.
        </Paragraph>
        <Paragraph>
          If role is not specified, <Text italic>$ENTITY will </Text> be used to
          extract role the entity plays in the sentence.
        </Paragraph>
        <Paragraph>
          e.g. <Text italic>law firms </Text> in extract names and and
          <Text italic>$ENTITY will </Text> in role will extract
          <Text italic>ABC LLP == represents the client</Text> from the sentence
          <Text italic>
            &quot;ABC LLP represents the client for all legal matters&quot;
          </Text>
        </Paragraph>
        <Alert message="This is an advanced feature. Consult with nlmatics support team."></Alert>
      </div>
    ),
  },
  extractRole: {
    placeHolderText: 'e.g. $ENTITY will',
    help: (
      <div className="nlm-search-tooltip-popover-content">
        <Paragraph>Enter page range to search within.</Paragraph>
      </div>
    ),
  },
};

// export const searchTips = {
//     question = (<b>Hell</b>)
// }
