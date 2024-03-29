import { DownOutlined, FilterOutlined, RightOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Col,
  Divider,
  Popover,
  Radio,
  Row,
  Select,
  Space,
} from 'antd';
import { useState } from 'react';

const WorkspaceGridReviewStatusFilter = ({
  reviewStatusFilterChanged,
  fields,
}) => {
  const [showReviewStatusFilter, setShowReviewStatusFilter] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fileReviewStatus, setFileReviewStatus] = useState('both');
  const [selectedFieldReviewStatus, setSelectedFieldReviewStatus] =
    useState('both');
  const { Option } = Select;

  const isFilterApplied = () =>
    fileReviewStatus !== 'both' || selectedFieldReviewStatus !== 'both';

  return (
    <div>
      <Popover
        trigger="click"
        placement="bottom"
        onOpenChange={visible => setShowReviewStatusFilter(visible)}
        open={showReviewStatusFilter}
        content={
          <Space direction="vertical">
            <Row>
              <Col>Files</Col>
            </Row>
            <Row>
              <Col>
                <Radio.Group
                  name={'file_name'}
                  defaultValue="both"
                  value={fileReviewStatus}
                  onChange={({ target: { value: reviewStatus } }) => {
                    setFileReviewStatus(reviewStatus);
                    setSelectedFieldId(null);
                    setSelectedFieldReviewStatus('both');
                    reviewStatusFilterChanged(
                      reviewStatus === 'both' ? null : { reviewStatus }
                    );
                    setShowReviewStatusFilter(false);
                  }}
                >
                  <Radio value="approved">Approved</Radio>
                  <Radio value="unapproved">Unapproved</Radio>
                  <Radio value="both">Both</Radio>
                </Radio.Group>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col>
                <Select
                  style={{ width: 300 }}
                  showSearch
                  value={selectedFieldId}
                  onChange={selectedFieldId => {
                    setSelectedFieldId(selectedFieldId);
                  }}
                  placeholder="Select field"
                >
                  {fields?.map(({ name, id }) => {
                    return (
                      <Option key={id} value={id}>
                        {name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
            </Row>
            <Row>
              <Col>
                <Radio.Group
                  disabled={!selectedFieldId}
                  name={selectedFieldId}
                  defaultValue="both"
                  value={selectedFieldReviewStatus}
                  onChange={({
                    target: { name: fieldId, value: reviewStatus },
                  }) => {
                    setFileReviewStatus('both');
                    setSelectedFieldReviewStatus(reviewStatus);
                    reviewStatusFilterChanged(
                      reviewStatus === 'both' ? null : { fieldId, reviewStatus }
                    );
                    setShowReviewStatusFilter(false);
                  }}
                >
                  <Radio value="approved">Approved</Radio>
                  <Radio value="unapproved">Unapproved</Radio>
                  <Radio value="both">Both</Radio>
                </Radio.Group>
              </Col>
            </Row>
          </Space>
        }
      >
        <Badge dot={isFilterApplied()} color="var(--brand-color-dark)">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowReviewStatusFilter(!showReviewStatusFilter)}
          >
            Review Status
            {showReviewStatusFilter ? <DownOutlined /> : <RightOutlined />}
          </Button>
        </Badge>
      </Popover>
    </div>
  );
};
export default WorkspaceGridReviewStatusFilter;
