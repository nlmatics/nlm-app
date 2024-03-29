import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { uploadAllFields } from '../../../../fetcher';

export default function FieldDefinitionsUploader({
  fieldBundleId,
  onUploadSuccess,
  onUploadError,
}) {
  const uploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 20,
    customRequest: async params => {
      try {
        const response = await uploadAllFields({
          file: params.file,
          fieldBundleId,
        });
        params.onSuccess(response.data, params.file);
        onUploadSuccess();
      } catch (error) {
        params.onError(error);
        onUploadError(error);
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error({
          content: `${info.file.name} file upload failed.`,
          duration: 3,
        });
      }
    },
  };
  return (
    <Upload.Dragger {...uploadProps} showUploadList={false}>
      <Button
        icon={<UploadOutlined />}
        size="large"
        type="primary"
        shape="circle"
      ></Button>
      <p style={{ padding: 5 }}>
        Click or drag a file with field definitions to upload
      </p>
    </Upload.Dragger>
  );
}
