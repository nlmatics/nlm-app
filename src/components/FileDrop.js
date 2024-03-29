import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ExclamationCircleTwoTone,
  LoadingOutlined,
  QuestionOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { message, Typography, Upload } from 'antd';
import { useContext } from 'react';
import AppContext from '../contexts/app/AppContext';

import { fetchDocuments, uploadFile } from '../utils/apiCalls';
import { useAuth } from '../utils/use-auth.js';
import { WorkspaceContext } from './WorkspaceContext';

const { Title } = Typography;
const { Dragger } = Upload;

export default function FileDrop({ workspaceDocumentsIngestionStatus }) {
  const workspaceContext = useContext(WorkspaceContext);
  const user = useAuth();
  const { isChattyPdf } = useContext(AppContext);

  // Custom uploader that checks for the correct file type before uploading
  const invokeCustomUpload = async params => {
    // REFER: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/x-markdown',
      'text/markdown',
      'text/html',
      'text/xml',

      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',

      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',

      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
    ];

    const data = new FormData();
    data.append(
      'file',
      params.file,
      params.file.name.replaceAll(/'|"|;|=/gi, '_')
    );

    if (allowedTypes.includes(params.file.type)) {
      let response = await uploadFile(
        workspaceContext.currentWorkspaceId,
        data
      );
      if (response) {
        params.onSuccess(response.data, params.file);
      } else {
        params.onError('unable to upload file', params.file);
      }
    } else {
      throw TypeError();
    }
  };

  // Determines which icon to render to show the file's status
  // returns a spinner if the file is uploading or is ingesting
  // returns a check mark if the file is uploaded and ingested successfully
  // returns a exclamation mark if the file is uploaded and ingested failed or if the file failed to upload
  // returns a clock if the file is uploaded and is waiting to ingest
  // returns a question mark if the file doesn't meet any of these
  const iconRender = file => {
    // matches the upload file object to the file in the workspace context
    let uploadedFile = null;
    if (file.response) {
      uploadedFile = workspaceDocumentsIngestionStatus.find(doc => {
        return file.response.id === doc.id;
      });
    }

    if (
      file.status === 'uploading' ||
      (!!uploadedFile && uploadedFile.status === 'ingest_inprogress')
    ) {
      return <LoadingOutlined className="loading-icon" />;
    } else if (!!uploadedFile && uploadedFile.status === 'ingest_ok') {
      return <CheckCircleOutlined className="check-icon" />;
    } else if (
      file.status === 'error' ||
      (!!uploadedFile && uploadedFile.status === 'ingest_failed')
    ) {
      return <ExclamationCircleOutlined className="exclamation-icon" />;
    } else if (file.status === 'done') {
      return <ClockCircleOutlined />;
    } else {
      return <QuestionOutlined />;
    }
  };

  // Tell the user if the upload was successful or not
  // Also checks if all the files are uploaded
  const onChange = info => {
    const { status } = info.file;
    // this feels like a bit much, honestly. Especially if a user uploads a number of docs at once
    // if (status === 'done') {
    //   message.success(`${info.file.name} uploaded successfully.`);
    // }
    if (status === 'error') {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: `${info.file.name} upload failed.`,
      });
    }

    const notFinished = info.fileList.some(file => {
      return file.status !== 'done';
    });
    if (!notFinished) {
      fetchDocuments(
        user,
        workspaceContext.currentWorkspaceId,
        workspaceContext.docListDocPerPage,
        0,
        null,
        workspaceContext.setDocuments,
        null,
        workspaceContext
      );
      workspaceContext.setRefreshGrid(true);
    }
  };

  // The props for the Upload component
  const uploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 20,
    customRequest: invokeCustomUpload,
    iconRender: iconRender,
    onChange: onChange,
  };

  return (
    <Dragger {...uploadProps}>
      <div
        style={{ padding: '5px', height: '150px', justifyContent: 'center' }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <Title level={5}>Click or drag file to this area to upload</Title>
        {!isChattyPdf() && (
          <Typography.Paragraph>
            Supported file types: .PDF, .DOCX, .HTML, .XML or .TXT
          </Typography.Paragraph>
        )}
        <Typography.Paragraph>
          Support for a single or bulk upload.
        </Typography.Paragraph>
      </div>
    </Dragger>
  );
}
