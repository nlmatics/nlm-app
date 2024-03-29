import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  Row,
  Typography,
  message,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import logoDarkTheme from '../../assets/images/redactor-logo-vertical-black-bg.svg';
import logoLightTheme from '../../assets/images/redactor-logo-vertical-white-bg.svg';
import favicon from '../../assets/images/Redactor-Logo.svg';
import { PlusOutlined, SwapOutlined } from '@ant-design/icons';
import ThemeContext from '../../contexts/theme/ThemContext';
import './index.css';

export default function Home() {
  const { theme, THEMES, switchTheme } = useContext(ThemeContext);
  const serviceUrl = 'https://dev-portal.nlmatics.com/api';
  const [inputPassage, setInputPassage] = useState('');
  const [redactedPassage, setRedactedPassage] = useState('');
  const [isRedacting, setIsRedacting] = useState(false);
  const [isUnredacting, setIsUnredacting] = useState(false);
  const [redactedInput, setRedactedInput] = useState('');
  const [unredactedOutput, setUnredactedOutput] = useState('');
  const [uuid, setUuid] = useState('');

  useEffect(() => {
    document.title = 'Redactor';
    let link = document.querySelector("link[rel~='icon']");
    link.href = favicon;
  }, []);

  const redact = async () => {
    setIsRedacting(true);
    fetch(`${serviceUrl}/anonymize`, {
      method: 'POST',
      body: JSON.stringify({ text: inputPassage }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async response => {
        const { text, uuid: ruuid } = await response.json();
        setIsRedacting(false);
        if (!ruuid) {
          setRedactedPassage('');
          message.warning('Nothing redactable found.');
        } else {
          setRedactedPassage(text);
        }
        setUuid(ruuid);
        return response;
      })
      .catch(error => console.error(error));
  };
  const unredact = async () => {
    setIsUnredacting(true);
    fetch(`${serviceUrl}/deanonymize`, {
      method: 'POST',
      body: JSON.stringify({
        text: redactedInput,
        uuid,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async response => {
        const { text } = await response.json();
        setIsUnredacting(false);
        setUnredactedOutput(text);
        return response;
      })
      .catch(error => console.error(error));
  };
  return (
    <Layout
      style={{ width: '100vw', height: '100vh', padding: 20, overflow: 'auto' }}
      className="redactor"
    >
      <Row justify="center" gutter={[20, 20]}>
        <Col span={3}></Col>
        <Col span={18} style={{ textAlign: 'center' }}>
          <img
            width={150}
            src={theme === THEMES.DARK ? logoDarkTheme : logoLightTheme}
          ></img>
        </Col>
        <Col span={3} style={{ textAlign: 'right' }}>
          <Button
            icon={<SwapOutlined />}
            title="Switch Theme"
            onClick={() => {
              switchTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
            }}
          ></Button>
        </Col>

        <Col span={24} style={{ textAlign: 'left' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setInputPassage('');
              setRedactedPassage('');
              setRedactedInput('');
              setUnredactedOutput('');
              setUuid('');
            }}
          >
            New Passage
          </Button>
        </Col>
        <Col span={12}>
          <Card
            title="Passage"
            extra={
              <Button
                type="primary"
                onClick={() => redact()}
                disabled={!inputPassage}
              >
                Redact
              </Button>
            }
          >
            <Input.TextArea
              value={inputPassage}
              bordered
              autoFocus
              rows={8}
              onChange={event => setInputPassage(event.target.value)}
              allowClear
            ></Input.TextArea>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Redacted Passage / Input for LLM"
            loading={isRedacting}
            style={{ height: '100%' }}
          >
            {redactedPassage && (
              <Typography.Text copyable>{redactedPassage}</Typography.Text>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Output from LLM"
            extra={
              <Button
                type="primary"
                onClick={() => unredact()}
                disabled={!uuid}
              >
                Unredact
              </Button>
            }
          >
            <Input.TextArea
              disabled={!uuid}
              value={redactedInput}
              bordered
              rows={8}
              onChange={event => setRedactedInput(event.target.value)}
              allowClear
            ></Input.TextArea>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Unredacted Output"
            loading={isUnredacting}
            style={{ height: '100%' }}
          >
            {unredactedOutput && (
              <Typography.Text copyable>{unredactedOutput}</Typography.Text>
            )}
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
