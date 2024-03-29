import { useState, useContext, useEffect } from 'react';
import { Modal, Upload, Typography, message } from 'antd';
import { WorkspaceContext } from './WorkspaceContext.js';
import {
  InboxOutlined,
  ExclamationCircleTwoTone,
  CheckCircleTwoTone,
  LoadingOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import API from '../utils/API.js';

const { Paragraph } = Typography;
const { Text } = Typography;
const { Title } = Typography;

export default function DictionaryUpload(props) {
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  const { Dragger } = Upload;
  const workspaceContext = useContext(WorkspaceContext);

  const invokeCustomUpload = async params => {
    var allowedtype = [
      'text/plain',
      'text/html',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const data = new FormData();
    data.append('file', params.file);
    try {
      if (allowedtype.includes(params.file.type)) {
        let response = await API.post(
          `/addPrivateDictionary/${workspaceContext.currentWorkspaceId}`,
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
    maxCount: 20,
    accept: '.txt',
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
        console.log('fileList', info.fileList);
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
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag a .txt file</p>
      <p>Supported file types: .txt</p>
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
      title="Upload Dictionary"
      open={fileUploadVisible} // keep modal open if a file failed
      footer={null}
      onCancel={handleCancel}
      destroyOnClose={true}
    >
      <Title level={5}>Instructions</Title>
      <Paragraph>
        Dictionary should be a .txt file, in which each line consists of a word
        and all it&apos;s equivalent terms/phrases separated by commas.
      </Paragraph>
      <Paragraph>
        Searching for any word in the comma separated list of words in a line
        will also return matches consisting of any other word in that line.
      </Paragraph>
      <Paragraph>
        <BulbOutlined />
        Only create a dictionary with domain specific acronyms and names - there
        is no need to create dictionaries with synonym words as nlmatics already
        accounts for those with semantic search
      </Paragraph>
      <Paragraph>
        <BulbOutlined />
        Do not create a dictionary entries with words that are not semantically
        interchangeable e.g. Apple,Steve Jobs
      </Paragraph>
      <Paragraph>
        <Text italic>Example: </Text>
        <li>IBM,International Business Machines,IBM.N</li>
        <li>BRCA1,RNF53,PPP1R53,FANCS</li>
      </Paragraph>
      {fileDrop}
    </Modal>
  );
}
