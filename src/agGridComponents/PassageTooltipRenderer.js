import Highlighter from 'react-highlight-words';

export const PassageTooltipRenderer = props => {
  props.reactContainer.classList.add('custom-tooltip');
  return props.value.match ? (
    <div className="custom-tooltip">
      <p>
        <Highlighter
          unhighlightClassName="cell-wrap-text"
          highlightClassName="answer-in-phrase-mark"
          searchWords={[props.value.answer]}
          autoEscape={true}
          textToHighlight={props.value.match}
        />
      </p>
    </div>
  ) : (
    <div className="custom-tooltip">
      <p> No passage </p>
    </div>
  );
};
