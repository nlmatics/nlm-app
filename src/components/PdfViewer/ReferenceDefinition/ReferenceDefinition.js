import { CloseOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography } from 'antd';
import Highlighter from 'react-highlight-words';
import './index.less';
import { useState } from 'react';
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export default function ReferenceDefinition({
  open,
  term,
  referenceDefinition,
  position,
  top,
  referenceDefinitions,
  onClose,
  isNested,
  isOutlineVisible,
}) {
  const [showNestedCard, setShowNestedCard] = useState(false);
  const [nestedReferenceDefinition, setNestedReferenceDefinition] = useState();
  const [nestedTerm, setNestedTerm] = useState();
  const wordsToHilight = Object.keys(referenceDefinitions || {});
  const getSearchWords = (wordsToHilight = []) =>
    wordsToHilight.flatMap(wordToHilight => [
      new RegExp(`\\b${escapeRegExp(String(wordToHilight))}\\b`),
      new RegExp(`\\b${escapeRegExp(String(wordToHilight))}\\B`),
    ]);

  const getHilightedDefinition = ({ block_text, block_idx, term }) => {
    return (
      <Typography.Paragraph
        key={block_idx}
        style={{ wordSpacing: 2, lineHeight: 2 }}
      >
        <Highlighter
          highlightClassName={'nlm-definition-term'}
          searchWords={getSearchWords(
            wordsToHilight.filter(word => word !== term)
          )}
          autoEscape={false}
          textToHighlight={block_text}
          caseSensitive={true}
          highlightTag={({ children, className }) => {
            return (
              <span
                className={className}
                onClick={() => {
                  setNestedReferenceDefinition(referenceDefinitions[children]);
                  setShowNestedCard(true);
                  setNestedTerm(children);
                }}
              >
                {children}
              </span>
            );
          }}
        />
      </Typography.Paragraph>
    );
  };
  const outlineWidth = 202;
  return (
    <>
      {open && (
        <>
          <Card
            size="small"
            className="nlm-definition-card"
            style={{
              position,
              top,
              left: 25,
              width: `calc(100% - ${
                isOutlineVisible ? outlineWidth + 70 : 70
              }px)`,
              borderWidth: isNested ? 1 : 15,
              margin: isNested
                ? `0 0 0 ${isOutlineVisible ? outlineWidth + 70 : 70}px`
                : `0 10px 0 ${isOutlineVisible ? outlineWidth + 10 : 10}px`,
            }}
            bodyStyle={{
              maxHeight: 'min-content',
              height: 'min-content',
              overflow: 'auto',
            }}
            title={term}
            extra={
              <Button
                size="small"
                icon={
                  <CloseOutlined
                    onClick={() => {
                      setShowNestedCard(false);
                      onClose();
                    }}
                  />
                }
              />
            }
          >
            <div
              style={{
                padding: '0 5px',
              }}
            >
              {referenceDefinition?.length > 1 ? (
                <Space direction="vertical">
                  {referenceDefinition.map(({ block_text, block_idx }) =>
                    getHilightedDefinition({ block_text, block_idx, term })
                  )}
                </Space>
              ) : (
                getHilightedDefinition({
                  block_text:
                    referenceDefinition && referenceDefinition[0]?.block_text,
                  block_idx:
                    referenceDefinition && referenceDefinition[0]?.block_idx,
                  term,
                })
              )}
            </div>
            {showNestedCard && (
              <ReferenceDefinition
                open={showNestedCard}
                referenceDefinition={nestedReferenceDefinition}
                position="static"
                top={0}
                term={nestedTerm}
                referenceDefinitions={referenceDefinitions}
                onClose={() => setShowNestedCard(false)}
                isNested
              />
            )}
          </Card>
        </>
      )}
    </>
  );
}
