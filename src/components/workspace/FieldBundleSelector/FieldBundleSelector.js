import { Select } from 'antd';
const { Option } = Select;
export default function FieldBundleSelector({
  fieldBundleId,
  fieldBundles,
  disabled,
  onSelect,
}) {
  return (
    <Select
      placeholder="Select field set"
      style={{ fontSize: '15px', fontWeight: 'bold', width: '100%' }}
      disabled={disabled}
      onSelect={onSelect}
      value={fieldBundleId}
      dropdownMatchSelectWidth={400}
    >
      {fieldBundles?.map(({ id, bundleName }) => (
        <Option value={id} key={id}>
          {bundleName}
        </Option>
      ))}
    </Select>
  );
}
