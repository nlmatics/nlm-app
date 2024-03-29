import Highlighter from 'react-highlight-words';

export const PassageCellRenderer = ({ data, colDef }) => {
  const field = data[colDef.field.split('_').slice(0, -1).join('_')];
  return (
    <div className="renderer-scrollbox">
      <div className="renderer-scrollbox-content">
        <Highlighter
          unhighlightClassName="cell-wrap-text"
          highlightClassName="answer-in-phrase-mark"
          searchWords={
            field.answer !== 'No' && field.match !== 'Yes' ? [field.answer] : []
          }
          autoEscape
          textToHighlight={field.match}
        />
      </div>
    </div>
  );
};
