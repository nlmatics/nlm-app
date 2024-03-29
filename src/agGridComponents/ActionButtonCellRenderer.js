import { Button, Tooltip } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

export const ActionButtonCellRenderer = ({ data, colDef }) => {
  const handleClick = () => {
    if (colDef.cellRendererParams) {
      colDef.cellRendererParams.clicked(data.file_idx);
    }
  };
  return (
    <Tooltip
      title={
        colDef.cellRendererParams.tooltip
          ? colDef.cellRendererParams.tooltip
          : 'More Options'
      }
    >
      <Button
        type="link"
        icon={<EllipsisOutlined />}
        onClick={e => handleClick(e)}
      ></Button>
    </Tooltip>
  );
};
