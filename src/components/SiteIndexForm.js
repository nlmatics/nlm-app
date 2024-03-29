import { useState, useContext } from 'react';

import {
  Form,
  InputNumber,
  Space,
  Checkbox,
  Popover,
  Input,
  Spin,
  Button,
} from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { indexWebsite } from '../utils/apiCalls';
import { WorkspaceContext } from './WorkspaceContext';

const nestedItemlayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

function SiteIndexForm(props) {
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  const [pdfOnly, setPdfOnly] = useState(false);
  const workspaceContext = useContext(WorkspaceContext);

  const onFinish = async values => {
    setProcessing(true);
    let apiData = {
      url: 'https://' + values.url,
      html_selector: {
        html_tag: values.htmlTag,
        html_name: values.htmlName,
        html_value: values.htmlValue,
      },
      title_selector: values.titleSelector.split(','),
      use_headless: !values.staticHTML,
      crawl_depth: values.crawlDepth,
      root_domain: values.rootDomain
        ? 'https://' + values.rootDomain
        : undefined,
      allowed_domain: values.allowedDomain
        ? 'https://' + values.allowedDomain
        : undefined,
      upload_pdf: values.uploadPDF || values.pdfOnly,
      pdf_only: values.pdfOnly,
      cookie_string: values.cookieString,
      bearer_token: values.bearerToken,
      request_headers: [],
    };
    console.log('indexing with params:', apiData);
    await indexWebsite(workspaceContext.currentWorkspace.id, apiData);
    props.onFinish();
    setProcessing(false);
  };

  const onFinishFailed = () => {};
  const onPDFOnlyChanged = e => {
    let isChecked = e.target.checked;
    setPdfOnly(isChecked);
    if (isChecked) {
      form.setFieldsValue({ uploadPDF: isChecked, htmlTag: 'none' });
    }
  };
  return (
    <Form
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
      name="basic"
      form={form}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 24 }}
      initialValues={{
        staticHTML: true,
        crawlDepth: 2,
        uploadPDF: false,
        pdfOnly: false,
        titleSelector: 'title,filename,FILENAME',
        cookieString: '',
        bearerToken: '',
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item label="Urls" required={true}>
        <Popover
          content={
            <div style={{ width: '300px' }}>
              <p>
                <b>Root url</b> is the url from which indexing will start.
                <p>This can be different from your website url.</p>
              </p>
              <p>
                For example root url can be https://blogs.nlmatics.com when
                website url is http://www.nlmatics.com
              </p>
              <p>
                This will result in indexing of everything underneath
                https://blogs.nlmatics.com
              </p>
              <p>
                Specify the same url as website url in <b>Restrict To</b> if you
                don&apos;t want the crawler to follow any links outside of your
                website.
              </p>
            </div>
          }
        >
          <Button icon={<QuestionOutlined />} type="link"></Button>
        </Popover>
        <Input.Group>
          <Form.Item
            {...nestedItemlayout}
            name="url"
            label="Url"
            placeholder="url to start indexing from e.g. blogs.nlmatics.com"
            rules={[{ required: true, message: 'Please input root url!' }]}
          >
            <Input addonBefore="https://" />
          </Form.Item>
          <Form.Item
            {...nestedItemlayout}
            name="rootDomain"
            label="Root Domain"
            placeholder="root url of your website e.g. www.nlmatics.com"
            rules={[{ required: false, message: 'Please input root url!' }]}
          >
            <Input addonBefore="https://" />
          </Form.Item>
          <Form.Item
            {...nestedItemlayout}
            name="allowedDomain"
            label="Restrict To"
            placeholder="Restrict crawling to content from this url only"
          >
            <Input addonBefore="https://" />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item
        {...nestedItemlayout}
        name="bearerToken"
        label="Bearer Token"
        placeholder="use auth token for indexing api behind a auth wall"
      >
        <Input />
      </Form.Item>
      <Form.Item
        {...nestedItemlayout}
        name="cookieString"
        label="Cookie String"
        placeholder="use authenticated cookie string for content behind auth wall"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Index PDFs only"
        name="pdfOnly"
        valuePropName="checked"
        rules={[
          { required: false, message: 'Please select pdf only crawl option!' },
        ]}
      >
        <Checkbox onChange={checked => onPDFOnlyChanged(checked)}></Checkbox>
      </Form.Item>
      <Form.Item label="Main Selector">
        <Popover
          content={
            <div style={{ width: '300px' }}>
              <p>
                A web page consists of headers, footers, sidebars and main
                content.
              </p>
              <p>
                These settings help you specify the main body of your content so
                that we can exclude the headers, footers and sidebars.
              </p>
              <p
                style={{
                  padding: '10px',
                }}
              >
                <code>
                  {
                    "<html>...header tags...<div class='main'>Test</div>...footer tags</html>"
                  }
                </code>
              </p>
              <p>
                In the example shown div is tag, class is attribute and main is
                the attribute value
              </p>
            </div>
          }
        >
          <Button icon={<QuestionOutlined />} type="link"></Button>
        </Popover>
        <Input.Group>
          <Form.Item
            name="htmlTag"
            label="Tag"
            {...nestedItemlayout}
            required={true}
            placeholder="Tag of the element that contains main content of your page."
            rules={[{ required: true, message: 'Please enter tag' }]}
          >
            <Input disabled={pdfOnly} />
          </Form.Item>
          <Form.Item
            name="htmlName"
            label="Attribute"
            {...nestedItemlayout}
            required={false}
            placeholder="Name of the attribute of the element that contains main content of your page."
            rules={[{ required: false, message: 'Please enter attribute' }]}
          >
            <Input disabled={pdfOnly} />
          </Form.Item>
          <Form.Item
            name="htmlValue"
            label="Value"
            {...nestedItemlayout}
            required={false}
            placeholder="Attribute value of the attribute that contains main content of your page."
            rules={[
              { required: false, message: 'Please enter attribute value' },
            ]}
          >
            <Input disabled={pdfOnly} />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item label="Title Selector" required>
        <Space>
          <Form.Item
            name="titleSelector"
            noStyle
            rules={[
              {
                required: true,
                message: 'Please input default title selectors',
              },
            ]}
          >
            <Input disabled={pdfOnly} />
          </Form.Item>
          <Popover
            content={
              <div style={{ width: '300px' }}>
                <p>
                  The page title is parsed from these tags within the head tag
                  of your page.
                </p>
              </div>
            }
          >
            <Button icon={<QuestionOutlined />} type="link"></Button>
          </Popover>
        </Space>
      </Form.Item>
      <Form.Item label="Static HTML" required>
        <Space>
          <Form.Item
            name="staticHTML"
            noStyle
            valuePropName="checked"
            rules={[
              {
                required: true,
                message:
                  'Please specify if files in website are static html or rendered synamically!',
              },
            ]}
          >
            <Checkbox disabled={pdfOnly}></Checkbox>
          </Form.Item>

          <Popover
            content={
              <div style={{ width: '300px' }}>
                <p>
                  It is highly recommended to check this option if your site
                  pages are static.
                </p>
                <p>
                  If your pages are dynamically generated by javascript, leave
                  this option unchecked.
                </p>
                <p>
                  Dynamic pages take much longer to crawl and parse as each page
                  is loaded in a offline browser
                </p>
              </div>
            }
          >
            <Button icon={<QuestionOutlined />} type="link"></Button>
          </Popover>
        </Space>
      </Form.Item>
      <Form.Item
        label="Include PDFs"
        name="uploadPDF"
        valuePropName="checked"
        rules={[{ required: true, message: 'Please select pdf crawl option!' }]}
      >
        <Checkbox disabled={pdfOnly}></Checkbox>
      </Form.Item>
      <Form.Item
        label="Depth"
        name="crawlDepth"
        rules={[{ required: true, message: 'Please input depth!' }]}
      >
        <InputNumber></InputNumber>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Spin spinning={processing}>
          <Button type="primary" htmlType="submit">
            Start Indexing
          </Button>
        </Spin>
      </Form.Item>
    </Form>
  );
}
export default SiteIndexForm;
