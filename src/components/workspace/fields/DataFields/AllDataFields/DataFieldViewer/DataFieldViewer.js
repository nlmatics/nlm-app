import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Spin, Tabs, Typography } from 'antd';
import { Suspense, useState } from 'react';
import { dataTypes } from '../../../../../../utils/constants';
import { getDataType } from '../../../../../../utils/helpers';
// import { FieldGrid } from '../../../../../FieldGrid';
import SearchCriteriaViewer from '../../../../../SearchCriteriaViewer';
import { chartTypes, getChartType } from '../../../../visualizations/utils';
import Visualization from '../../../../visualizations/Visualizations/Visualization/Visualization';
import { lazy } from 'react';
const WorkspaceGrid = lazy(() => import('../../../../../WorkspaceGrid'));

import './index.less';
import useUserInfo from '../../../../../../hooks/useUserInfo';
import useFieldExtractionStatus from '../../../useFieldExtractionStatus';

export default function DataFieldViewer({
  dataField,
  setDataField,
  workspaceId,
  fieldBundleId,
  fields,
}) {
  const [expand, setExpand] = useState(false);
  const { isFeatureIncluded, FEATURES } = useUserInfo();
  const { isExtractionInProgress } = useFieldExtractionStatus({
    fieldBundleId,
    fieldId: dataField.id,
  });

  const fieldDataLabel = isExtractionInProgress() ? (
    <span>
      <SyncOutlined spin />
      Field Data
    </span>
  ) : (
    'Field Data'
  );
  const dataType = getDataType(dataField, dataField.options);
  const chartType = getChartType({ dataType });

  const canBeVisualized = dataType => {
    return (
      dataType === dataTypes.BOOLEAN ||
      dataType === dataTypes.NUMBER ||
      dataType === dataTypes.MONEY
    );
  };
  return (
    <Row className="nlm-dataFieldViewer">
      <Col span={24}>
        <Card
          className={expand ? 'nlm-dataFieldViewer__expand' : ''}
          size="small"
          title={
            <Typography.Title level={5}>{dataField.name} </Typography.Title>
          }
          bodyStyle={{
            height: `calc(100vh - ${expand ? 122 : 222}px)`,
            overflowY: 'auto',
            padding: 15,
            paddingTop: 0,
          }}
          extra={
            <>
              <Button
                style={{ marginLeft: 20 }}
                icon={expand ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={() => setExpand(!expand)}
              ></Button>
              <Button
                style={{ marginLeft: 20 }}
                icon={<CloseOutlined />}
                onClick={() => setDataField(null)}
              ></Button>
            </>
          }
        >
          <Tabs
            defaultActiveKey="fieldData"
            items={[
              {
                label: fieldDataLabel,
                key: 'fieldData',
                children: (
                  <div key={dataField.id} className="nlm-field-grid">
                    <Suspense fallback={<Spin />}>
                      <WorkspaceGrid
                        showOnlyFieldId={dataField.id}
                        expandedView={expand}
                      />
                    </Suspense>
                  </div>
                ),
              },
              {
                label: 'Field Definition',
                key: 'fieldDefinition',
                children: (
                  <SearchCriteriaViewer
                    fieldDefinition={dataField?.searchCriteria}
                  ></SearchCriteriaViewer>
                ),
              },
              ...(isFeatureIncluded(FEATURES.VISUALIZATION) &&
              canBeVisualized(dataType)
                ? [
                    {
                      label: 'Field Analytics',
                      key: 'fieldAnalytics',
                      children: (
                        <Visualization
                          height={400}
                          rowGroupCols={[
                            {
                              id: dataField.id,
                              field: dataField.id,
                              type:
                                chartType === chartTypes.NUMERIC &&
                                dataTypes.NUMBER,
                            },
                          ]}
                          fieldBundleId={fieldBundleId}
                          workspaceId={workspaceId}
                          isExpanded={false}
                          chartType={chartType}
                          allFields={fields}
                          valueCols={dataField.options.valueCols}
                          fieldIds={[dataField.id]}
                        ></Visualization>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}
