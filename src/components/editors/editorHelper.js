import { dataTypes } from '../../utils/constants.js';
import BooleanCellEditor from './BooleanCellEditor';
import DateCellEditor from './DateCellEditor';
import LongTextCellEditor from './LongTextCellEditor';
import MoneyCellEditor from './MoneyCellEditor.js';
import NumericCellEditor from './NumericCellEditor';
import PeriodCellEditor from './PeriodCellEditor';

export const getEditorByDataType = ({
  dataType,
  editable,
  reset,
  onEdit,
  cellValue,
}) => {
  let editor = null;
  if (dataType === dataTypes.DATE) {
    editor = (
      <DateCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  } else if (dataType === dataTypes.NUMBER) {
    editor = (
      <NumericCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  } else if (dataType === dataTypes.MONEY) {
    editor = (
      <MoneyCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  } else if (dataType === dataTypes.BOOLEAN) {
    editor = (
      <BooleanCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  } else if (dataType === dataTypes.PERIOD) {
    editor = (
      <PeriodCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  } else {
    editor = (
      <LongTextCellEditor
        disabled={!editable}
        reset={reset}
        onEdit={onEdit}
        cellValue={cellValue}
      />
    );
  }
  return editor;
};
