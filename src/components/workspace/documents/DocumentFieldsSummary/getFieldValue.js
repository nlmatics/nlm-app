import { dataTypes, dataTypesFormatters } from '../../../../utils/constants';
import { getDataType } from '../../../../utils/helpers';

const isGroupEnabledInCriteria = cellData => {
  let fieldCriterias = cellData?.fieldDefinition?.criterias;
  let isGrouped =
    cellData.fieldDefinition?.isGrouped || //to handle document view invocation
    (fieldCriterias &&
      fieldCriterias.length > 0 &&
      fieldCriterias[0].groupFlag === 'enable');
  return isGrouped;
};

export default function getFieldValue(cellData) {
  let lines = [];
  let cellValue = '-';
  let dataType = getDataType(cellData.fieldDefinition, cellData.options);
  let formatter = dataTypesFormatters[dataType];
  let isGrouped = isGroupEnabledInCriteria(cellData);
  if (cellData.answerItem) {
    if (
      dataType === dataTypes.LIST &&
      cellData?.fieldDefinition?.options?.selectionType === 'multiple' &&
      Array.isArray(cellData?.answerItem?.answer)
    ) {
      let listItems = cellData?.answerItem?.answer?.map((dataItem, index) => {
        if (typeof dataItem === 'string') {
          if (dataItem !== '') {
            return <li key={index}>{dataItem}</li>;
          }
        } else {
          console.log('incorrect data format', dataItem);
        }
      });
      if (listItems.length > 0) {
        cellValue = <ul className={'nlm-grid-list-formatted'}>{listItems}</ul>;
      }
    } else if (formatter) {
      if (!isGrouped) {
        cellValue = formatter(cellData.answerItem);
      } else {
        let matches = cellData.answerItem?.matches;
        if (!matches) {
          matches = [cellData.answerItem];
        }
        const dataItems = matches?.map(match => formatter(match));
        if (dataItems && dataItems.join('') !== '') {
          let listItems = dataItems?.map((dataItem, index) => {
            if (typeof dataItem === 'string') {
              if (dataItem !== '') {
                return <li key={index}>{dataItem}</li>;
              }
            } else {
              console.log('incorrect data format', dataItem);
            }
          });
          cellValue = (
            <ul className={'nlm-grid-list-formatted'}>{listItems}</ul>
          );
        } else {
          cellValue = <div>-</div>;
        }
      }
    } else {
      if (
        Object.prototype.hasOwnProperty.call(
          cellData.answerItem,
          'formatted_answer'
        )
      ) {
        cellValue = cellData.answerItem.formatted_answer;
        if (isGrouped && cellData.answerItem.matches) {
          for (let match of cellData.answerItem.matches) {
            lines.push(match.answer);
          }
        } else if (Array.isArray(cellValue)) {
          lines = cellValue;
          if (lines.length == 0) {
            cellValue = '-';
          }
        } else if (cellValue?.split) {
          lines = cellValue.split('/n');
        }
        if (lines.length > 1) {
          let listItems = lines.map((line, index) => (
            <li key={index}>{line}</li>
          ));
          cellValue = <ul className={'nlm-grid-list'}>{listItems}</ul>;
        }
      } else if (
        Object.prototype.hasOwnProperty.call(cellData.answerItem, 'answer')
      ) {
        cellValue = cellData.answerItem.answer;
      } else {
        cellValue = '-';
      }
    }
    if (cellValue === '-' || cellValue === '') {
      if (cellData.answerItem.phrase) {
        cellValue = '+';
      }
    }
  }

  return cellValue;
}
