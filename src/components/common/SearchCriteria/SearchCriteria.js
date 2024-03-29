import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Carousel, Col, Row } from 'antd';
import { useRef } from 'react';
import SearchCriterion from '../SearchCriterion';

import './index.less';

export default function SearchCriteria({
  criteria,
  setAdvancedSearchVisible,
  setCurrentCriterionIndex,
}) {
  const carouselRef = useRef(null);
  return (
    <div className="nlm-searchCriteria">
      <Row justify="center" wrap={false} align="middle">
        <Col
          flex="36px"
          style={{ margin: 10, textAlign: 'left' }}
          className="nlm-searchCriteria__left-button"
        >
          {criteria?.length > 1 && (
            <Button
              size="small"
              disabled={criteria.length === 1}
              onClick={() => carouselRef.current.prev()}
              icon={<ArrowLeftOutlined />}
            />
          )}
        </Col>
        <Col flex="300px" className="nlm-searchCriteria__criterion">
          <Carousel
            ref={carouselRef}
            dots={false}
            afterChange={currentCriterionIndex => {
              setCurrentCriterionIndex(currentCriterionIndex);
            }}
          >
            {criteria.map((criterion, index) => (
              <SearchCriterion
                key={criterion.criteriaRank}
                index={index}
                criterion={criterion}
                setAdvancedSearchVisible={setAdvancedSearchVisible}
              />
            ))}
          </Carousel>
        </Col>
        <Col
          flex="36px"
          style={{ margin: 10, textAlign: 'right' }}
          className="nlm-searchCriteria__right-button"
        >
          {criteria?.length > 1 && (
            <Button
              size="small"
              disabled={criteria.length === 1}
              onClick={() => carouselRef.current.next()}
              icon={<ArrowRightOutlined />}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
