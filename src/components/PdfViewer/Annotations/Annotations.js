import { Card, Checkbox, Col, Menu, Row } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ThemeContext from '../../../contexts/theme/ThemContext';
import { getUniqueEntityConfigByLabel } from '../../../utils/helpers';
import './index.css';

const Annotations = ({
  toggleHilightColor,
  hilightAllPhrases,
  unHilightAllPhrases,
  entityLabelConfig,
}) => {
  const { theme } = useContext(ThemeContext);

  const hilightAnnotations =
    localStorage.getItem('hilight-annotations') === null ||
    localStorage.getItem('hilight-annotations') === 'true';
  const uniqueEntityConfigByLabel =
    getUniqueEntityConfigByLabel(entityLabelConfig);
  const [allSelected, setAllSelected] = useState(hilightAnnotations);
  const allAnnotationsSelectedMap = Object.fromEntries(
    new Map(uniqueEntityConfigByLabel.map(({ color }) => [color, true]))
  );
  const noneAnnotationsSelectedMap = Object.fromEntries(
    new Map(uniqueEntityConfigByLabel.map(({ color }) => [color, false]))
  );
  const allAnnotationsStatusMap = Object.fromEntries(
    new Map(
      uniqueEntityConfigByLabel.map(({ color, defaultHilight }) => [
        color,
        defaultHilight,
      ])
    )
  );
  const [annotationsStatusMap, setAnnotationsStatusMap] = useState(
    hilightAnnotations ? allAnnotationsStatusMap : {}
  );
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const selectedAnnotationsCount = Object.values(annotationsStatusMap).filter(
      value => value
    ).length;

    const totalAnnotationsCount = Object.keys(allAnnotationsStatusMap).length;

    const allSelected = selectedAnnotationsCount === totalAnnotationsCount;

    const noneSelected = selectedAnnotationsCount == 0;

    const isDeterminate = allSelected || noneSelected;

    if (isDeterminate) {
      setIndeterminate(false);
      allSelected && setAllSelected(true);
      noneSelected && setAllSelected(false);
    } else {
      setIndeterminate(true);
    }
  }, [annotationsStatusMap]);

  return (
    <Row gutter={[5, 5]} wrap={false}>
      <Col span={24}>
        <Card bodyStyle={{ padding: 0 }}>
          <div className="nlm-pdf-annotations">
            <Menu
              theme={theme}
              mode="vertical"
              selectable={false}
              items={[
                {
                  key: 'all',
                  label: (
                    <Checkbox
                      defaultChecked
                      checked={allSelected}
                      indeterminate={indeterminate}
                      onChange={({ target: { checked } }) => {
                        setAllSelected(checked);
                        setAnnotationsStatusMap(
                          checked
                            ? allAnnotationsSelectedMap
                            : noneAnnotationsSelectedMap
                        );
                        checked ? hilightAllPhrases() : unHilightAllPhrases();
                      }}
                    >
                      All
                    </Checkbox>
                  ),
                },
                ...uniqueEntityConfigByLabel.map(({ color, label }) => {
                  return {
                    key: color,
                    label: (
                      <Checkbox
                        defaultChecked
                        checked={annotationsStatusMap[color]}
                        onChange={event => {
                          const {
                            target: { checked },
                          } = event;

                          toggleHilightColor({ color, checked });
                          setAnnotationsStatusMap({
                            ...annotationsStatusMap,
                            [color]: checked,
                          });
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <span
                            style={{ backgroundColor: color }}
                            className="nlm-pdf-annotation-label-hilighter"
                          >
                            {label}
                          </span>
                          <span className="nlm-pdf-annotation-label">
                            {label}
                          </span>
                        </div>
                      </Checkbox>
                    ),
                  };
                }),
              ]}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};
export default Annotations;
