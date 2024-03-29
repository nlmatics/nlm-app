import { Tooltip } from 'antd';
import { UserOverridenIcon, LowConfidenceIcon } from '../assets/Icons.js';
import { statusTypes } from '../utils/constants.js';

export const StatusCellRenderer = props => {
  if (props.value === statusTypes.OVERRIDEN)
    return (
      <div>
        <Tooltip title="The answer to this filed is overriden by an user.">
          <UserOverridenIcon />
        </Tooltip>
      </div>
    );
  else if (props.value === statusTypes.LOW_CONFIDENCE)
    return (
      <div>
        <Tooltip
          title={`Confidence level is less than ${statusTypes.CONFIDENCE_LEVEL}`}
        >
          <LowConfidenceIcon />
        </Tooltip>
      </div>
    );

  return <div />;
};
