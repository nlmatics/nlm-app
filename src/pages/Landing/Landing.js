import { Alert, Button, Col, Row, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import API from '../../utils/API.js';
import nlmaticsLogoLightTheme from '../../assets/images/nlmatics-logo-vertical-white-bg.svg';
import nlmaticsLogoDarkTheme from '../../assets/images/nlmatics-logo-vertical-black-bg.svg';
import ChattyPDFLogoLightTheme from '../../assets/images/chattypdf-logo-vertical-white-bg.svg';
import ChattyPDFLogoDarkTheme from '../../assets/images/chattypdf-logo-vertical-black-bg.svg';
import ChattyPDFFavicon from '../../assets/images/ChattyPDF-favicon.svg';
import ThemeContext from '../../contexts/theme/ThemContext';
import { useLocation } from 'react-router-dom';
import AppContext from '../../contexts/app/AppContext.js';

const ERROR_DESCRIPTIONS = {
  SA_ERR_CODE_1:
    'Please complete the email verification process before attempting to log in again.',
  SA_ERR_CODE_2:
    'Email, Password combination is blocked. Please login using Azure AD to continue.',
};

export default function Landing({ from }) {
  const [authLink, setAuthLink] = useState('');
  const { theme, THEMES } = useContext(ThemeContext);
  const location = useLocation();
  const params = new URLSearchParams(location?.search);
  const errorCode = params.get('errorCode');
  const { isChattyPdf, isEDGAR } = useContext(AppContext);

  localStorage.setItem('redirectUrl', from);

  useEffect(() => {
    if (isChattyPdf()) {
      let link = document.querySelector("link[rel~='icon']");
      link.href = ChattyPDFFavicon;
    }
  }, []);

  useEffect(() => {
    if (authLink) {
      window.location.href = authLink;
    }
  }, [authLink]);

  const getRedirectUrl = async () => {
    try {
      const response = await API.get(`auth/loginUrl`);
      // console.log(response.data);
      setAuthLink(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };
  let errorMessageProps;
  if (errorCode && errorCode === 'SA_ERR_CODE_1') {
    errorMessageProps = {
      message: 'Pending Email Verification',
      type: 'info',
    };
  } else {
    errorMessageProps = {
      message: 'Access denied',
      type: 'error',
    };
  }
  return (
    <Row align="middle" style={{ height: '100vh' }}>
      <Col span={24}>
        <Row justify="center" align="middle">
          <Col span={24}>
            {errorCode && (
              <Row
                style={{ marginBottom: 20, textAlign: 'left' }}
                justify="center"
              >
                <Col span={18}>
                  <Alert
                    {...errorMessageProps}
                    description={ERROR_DESCRIPTIONS[errorCode] || errorCode}
                    showIcon
                    closable
                  />
                </Col>
              </Row>
            )}
            <Row justify="center" style={{ marginBottom: 50 }}>
              <Col>
                <img
                  src={
                    theme === THEMES.LIGHT
                      ? isChattyPdf()
                        ? ChattyPDFLogoLightTheme
                        : nlmaticsLogoLightTheme
                      : isChattyPdf()
                      ? ChattyPDFLogoDarkTheme
                      : nlmaticsLogoDarkTheme
                  }
                  alt={isChattyPdf() ? 'ChattyPDF Logo' : 'nlmatics Logo'}
                  style={{ width: '10vw', minWidth: 150 }}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Col>
                {isChattyPdf() && from === '/import' ? (
                  <Button
                    size="large"
                    type="primary"
                    style={{ width: 200 }}
                    onClick={() => {
                      if (!localStorage.getItem('access_token')) {
                        window.authWindow = window.open(
                          'https://chat.chattypdf.com',
                          '_blank'
                        );
                      }
                    }}
                  >
                    {localStorage.getItem('access_token') ? 'Reload' : 'Login'}
                  </Button>
                ) : (
                  <Button
                    size="large"
                    type="primary"
                    onClick={getRedirectUrl}
                    style={{ width: 200 }}
                  >
                    Login
                  </Button>
                )}
              </Col>
            </Row>
            <Row justify="center" style={{ marginTop: 100 }}>
              <Col span={8} style={{ textAlign: 'center' }}>
                {isChattyPdf() || isEDGAR() ? (
                  <>
                    <Button
                      href="https://app.termly.io/document/terms-of-use-for-website/36a78af4-c112-43b8-875e-2ea5bba12e9e"
                      type="link"
                      target="_blank"
                    >
                      Terms of Service
                    </Button>
                    <Button
                      href="https://app.termly.io/document/privacy-policy/9ced070d-6e75-4907-a134-b13c45749967"
                      type="link"
                      target="_blank"
                    >
                      Privacy Policy
                    </Button>
                  </>
                ) : (
                  <Typography.Text type="secondary">
                    Refer to the Master Service Agreement (MSA) between your
                    firm and NLMATICS CORP. for Terms of Service and Privacy
                    Policy.
                  </Typography.Text>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
