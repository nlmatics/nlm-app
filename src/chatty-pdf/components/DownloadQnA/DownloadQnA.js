import { FilePdfOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Layout, Space, Typography } from 'antd';
import { forwardRef, useContext } from 'react';
import ThemeContext from '../../../contexts/theme/ThemContext';
import chattypdfDarkTheme from '../../../assets/images/chattypdf-logo-horizontal-black-bg.svg';
import chattypdfLightTheme from '../../../assets/images/chattypdf-logo-horizontal-white-bg.svg';
import nlmaticsDarkTheme from '../../../assets/images/nlmatics-logo-horizontal-black-bg.svg';
import nlmaticsLightTheme from '../../../assets/images/nlmatics-logo-horizontal-white-bg.svg';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import AppContext from '../../../contexts/app/AppContext';

export default forwardRef(function DownloadQnA(
  { documentName, answer, question },
  questionAnswerElementRef
) {
  const { isChattyPdf } = useContext(AppContext);
  const { theme, THEMES } = useContext(ThemeContext);
  return (
    <Layout
      ref={questionAnswerElementRef}
      style={{
        padding: 20,
        width: 500,
      }}
    >
      <Space>
        <FilePdfOutlined />
        <Typography.Text
          style={{ marginBottom: 5, whiteSpace: 'break-spaces' }}
          ellipsis
          title={documentName}
        >
          {documentName}
        </Typography.Text>
      </Space>
      <Card
        size="small"
        title="Ask a Question"
        headStyle={{ display: 'flex' }}
        bodyStyle={{ padding: 5 }}
      >
        <Layout
          style={{ position: 'relative', padding: 10, paddingBottom: 32 }}
        >
          {question}
          <Button
            style={{ position: 'absolute', bottom: 0, right: 0 }}
            type="link"
            icon={<SendOutlined />}
          ></Button>
        </Layout>
      </Card>
      <Card
        style={{
          marginTop: 5,
        }}
        bodyStyle={{
          padding: 12,
        }}
        title="Answer"
        size="small"
        extra={
          <img
            width={100}
            src={
              theme === THEMES.LIGHT
                ? isChattyPdf()
                  ? chattypdfLightTheme
                  : nlmaticsLightTheme
                : isChattyPdf()
                ? chattypdfDarkTheme
                : nlmaticsDarkTheme
            }
            alt={`${isChattyPdf() ? 'Chatty PDF' : 'nlmatics'} Logo`}
          />
        }
      >
        {
          <Typography.Paragraph
            style={{
              marginBottom: 0,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </Typography.Paragraph>
        }
      </Card>
      <Typography.Link style={{ textAlign: 'right', fontSize: 12 }}>
        {isChattyPdf() ? 'chattypdf.com' : 'nlmatics.com'}
      </Typography.Link>
    </Layout>
  );
});
