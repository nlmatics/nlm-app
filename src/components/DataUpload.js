import { useState, useContext, useEffect } from 'react';

import {
  Modal,
  Upload,
  message,
  Space,
  Alert,
  Descriptions,
  InputNumber,
  Typography,
} from 'antd';

import { WorkspaceContext } from './WorkspaceContext.js';
import {
  ExclamationCircleTwoTone,
  CheckCircleTwoTone,
  LoadingOutlined,
  FileExcelTwoTone,
} from '@ant-design/icons';
import API from '../utils/API.js';

export default function DataUpload(props) {
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  const { Dragger } = Upload;
  const [fileNameColumn, setFileNameColumn] = useState(1);
  const [titleStartColumn, setTitleStartColumn] = useState(1);
  const [titleSpan, setTitleSpan] = useState(1);
  const workspaceContext = useContext(WorkspaceContext);

  const invokeCustomUpload = async params => {
    var allowedtype = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const data = new FormData();
    data.append('file', params.file);
    try {
      if (allowedtype.includes(params.file.type)) {
        let titleEndColumn = titleStartColumn + titleSpan;
        let response = await API.post(
          `/uploadData/${workspaceContext.currentWorkspaceId}/${fileNameColumn}/${titleStartColumn}/${titleEndColumn}`,
          data,
          {
            headers: {
              'Content-Type':
                'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s',
            },
          }
        );
        params.onSuccess(response.data, params.file);
      } else {
        throw TypeError();
      }
    } catch (error) {
      params.onError(error.reason || error);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    customRequest: invokeCustomUpload,
    iconRender(file) {
      if (file.status === 'done')
        return <CheckCircleTwoTone twoToneColor="var(--success-color-green)" />;
      else if (file.status === 'error')
        return (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        );
      else return <LoadingOutlined />;
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        //todo June invoke tree reload
        // setFileUploadVisible(false);
      } else if (status === 'error') {
        message.error({
          icon: (
            <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
          ),
          content: `${info.file.name} file upload failed.`,
          duration: 3,
        });
      }
    },
  };

  const fileDrop = (
    <Dragger {...uploadProps}>
      <Typography.Paragraph className="ant-upload-drag-icon">
        <FileExcelTwoTone />
      </Typography.Paragraph>
      <Typography.Paragraph className="ant-upload-text">
        Click or drag file to this area to upload
      </Typography.Paragraph>
      <Typography.Paragraph>
        Supported file types: .CSV, .XLS, .XLSX
      </Typography.Paragraph>
      <Typography.Paragraph className="ant-upload-hint">
        Support for a single file only.
      </Typography.Paragraph>
    </Dragger>
  );

  useEffect(() => {
    setFileUploadVisible(props.visible);
  }, [props.visible]);

  const handleCancel = () => {
    props.onClose();
  };

  return (
    <Modal
      title="Upload Data from Spreadsheet"
      width={'50vw'}
      open={fileUploadVisible} // keep modal open if a file failed
      footer={null}
      onCancel={handleCancel}
      destroyOnClose={true}
    >
      <Space direction="vertical">
        <Alert
          description="This feature allows bulk upload using spreadsheet. Each Row of data is converted to a file in the workspace."
          type="success"
        />
        <Alert
          description="First row in the spreadsheet should be headers."
          type="info"
          showIcon
        />
        <Alert
          description="Include a unique column that can be used as file name for each row."
          type="info"
          showIcon
        />
        <Alert
          description="Specify Range of Columns (Title Column and Title Column Span) to use as title for each row"
          type="info"
          showIcon
        />
      </Space>
      <Descriptions
        labelStyle={{ fontWeight: 'bold' }}
        style={{ marginTop: '10px', marginBottom: '10px' }}
        layout="vertical"
      >
        <Descriptions.Item label="File Name Column">
          <InputNumber
            min={1}
            max={10}
            value={fileNameColumn}
            onChange={v => setFileNameColumn(v)}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Title Column Start">
          <InputNumber
            min={1}
            max={10}
            value={titleStartColumn}
            onChange={v => setTitleStartColumn(v)}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Title Column Span">
          <InputNumber
            min={1}
            max={3}
            value={titleSpan}
            onChange={v => setTitleSpan(v)}
          />
        </Descriptions.Item>
      </Descriptions>
      {fileDrop}
    </Modal>
  );
}
