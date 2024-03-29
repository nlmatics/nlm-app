import { Badge } from 'antd';

export default function BetaFeature({ children }) {
  return (
    <Badge
      size="small"
      status="warning"
      count="&beta;"
      offset={[10, 0]}
      title="Please be advised that this feature is still in beta mode."
    >
      {children}
    </Badge>
  );
}
