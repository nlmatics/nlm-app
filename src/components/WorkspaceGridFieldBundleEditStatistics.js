import {
  Col,
  Modal,
  Radio,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { fetchFieldBundleStats } from './workspace/fetcher';

export default function WorkspaceGridFieldBundleEditStatistics({
  setEditStatsVisible,
  workspaceId,
  fieldBundleId,
}) {
  const [editStats, setEditStats] = useState({
    rowStats: [],
    colStats: {},
    totalStats: {},
    totalFiles: 0,
    totalEdits: 0,
    totalFields: 0,
  });
  const [isFetchingEditStats, setIsFetchingEditStats] = useState(false);

  useEffect(() => {
    async function getFieldBundleStats({ workspaceId, fieldBundleId }) {
      setIsFetchingEditStats(true);
      const response = await fetchFieldBundleStats({
        workspaceId,
        fieldBundleId,
      });
      setEditStats(response.data);
      setIsFetchingEditStats(false);
    }
    workspaceId &&
      fieldBundleId &&
      getFieldBundleStats({ workspaceId, fieldBundleId });
  }, [workspaceId, fieldBundleId]);

  const [statisticsType, setStatisticsType] = useState('document');

  return (
    <Modal
      title="Edit Statistics"
      footer={null}
      open
      onCancel={() => setEditStatsVisible(false)}
      destroyOnClose
      width={'60vw'}
    >
      {isFetchingEditStats ? (
        <Skeleton paragraph={{ rows: 15 }} active />
      ) : (
        <>
          <Row gutter={8} style={{ width: '100%' }}>
            <Col span={6}>
              <Statistic
                title="# of Files"
                value={editStats.totalFiles}
              ></Statistic>
              <Statistic
                title="# of Cells"
                value={editStats.totalFields}
              ></Statistic>
            </Col>
            <Col span={6}>
              <Statistic
                title="# of Fields"
                value={editStats.nFieldsPerDocument}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="# of Edits"
                value={editStats.totalEdits}
              ></Statistic>
              <Statistic
                title="% Not Edited"
                value={Math.round(
                  ((editStats.totalFields - editStats.totalEdits) * 100) /
                    editStats.totalFields
                )}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="# of Approved Fields"
                value={editStats.totalApprovals}
              ></Statistic>
              <Statistic
                title="% Approved"
                value={Math.round(
                  (editStats.totalApprovals * 100) / editStats.totalFields
                )}
              />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={16}>
              <Space>
                <Typography.Title level={5}>Statistics by:</Typography.Title>
                <Radio.Group
                  onChange={e => setStatisticsType(e.target.value)}
                  value={statisticsType}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio value={'document'}>Document</Radio>
                  <Radio value={'field'}>Field</Radio>
                </Radio.Group>
              </Space>
            </Col>
          </Row>
          <Row style={{ width: '100%', height: '50vh', overflowY: 'auto' }}>
            {statisticsType === 'document' && (
              <table style={{ width: '100%' }}>
                {
                  <tr>
                    <th>File</th>
                    <th style={{ textAlign: 'right' }}># of Edits</th>
                    <th style={{ textAlign: 'right' }}># of Approved</th>
                    <th style={{ textAlign: 'right' }}>% Not Edited</th>
                    <th style={{ textAlign: 'right' }}>% Approved</th>
                  </tr>
                }
                {editStats.rowStats.map((item, index) => {
                  return (
                    <tr key={index} style={{ width: '100%' }}>
                      <td>{item.fileName}</td>
                      <td style={{ textAlign: 'right' }}>{item.nEdits}</td>
                      <td style={{ textAlign: 'right' }}>{item.nApprovals}</td>
                      <td style={{ textAlign: 'right' }}>
                        <b>
                          {Math.round(
                            ((editStats.nFieldsPerDocument - item.nEdits) *
                              100) /
                              editStats.nFieldsPerDocument
                          )}
                        </b>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <b>
                          {Math.round(
                            (item.nApprovals * 100) /
                              editStats.nFieldsPerDocument
                          )}
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </table>
            )}
            {statisticsType === 'field' && (
              <table style={{ width: '100%' }}>
                {
                  <tr>
                    <th>Field</th>
                    <th style={{ textAlign: 'right' }}># of Edits</th>
                    <th style={{ textAlign: 'right' }}># of Approved</th>
                    <th style={{ textAlign: 'right' }}>% Not Edited</th>
                    <th style={{ textAlign: 'right' }}>% Approved</th>
                  </tr>
                }
                {editStats.colStats.map((item, index) => {
                  return (
                    <tr key={index} style={{ width: '100%' }}>
                      <td>{item.fieldName}</td>
                      <td style={{ textAlign: 'right' }}>{item.nEdits}</td>
                      <td style={{ textAlign: 'right' }}>{item.nApprovals}</td>
                      <td style={{ textAlign: 'right' }}>
                        <b>
                          {Math.round(
                            ((editStats.totalFiles - item.nEdits) * 100) /
                              editStats.totalFiles
                          )}
                        </b>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <b>
                          {Math.round(
                            (item.nApprovals * 100) / editStats.totalFiles
                          )}
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </table>
            )}
          </Row>
        </>
      )}
    </Modal>
  );
}
