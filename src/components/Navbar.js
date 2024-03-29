import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Row, Col, Typography, Alert } from 'antd';
import logo from '../nlm-full-logo.png';
import loginSplashImage from '../assets/nlm-login-splash.png';
import API from '../utils/API.js';

const { Text } = Typography;
const useStyles = makeStyles({
  logo: {
    width: '120px',
  },
  navItem: {
    cursor: 'pointer',
    lineHeight: '40px !important',
  },
});

export default function Navbar(props) {
  const classes = useStyles();
  const [authLink, setAuthLink] = useState('');

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

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Col gutter={48}>
        <Row justify="center" gutter={[8, 48]}>
          <img
            style={{ width: '40%' }}
            src={logo}
            className={classes.logo}
            alt="nlmatics"
          />
        </Row>
        <Row justify="center" gutter={[4, 32]}>
          <Text
            style={{ fontSize: '16px', textAlign: 'center' }}
            className="nlm-login-tagline"
          >
            Intelligent Search for the Inquisitive Mind
          </Text>
        </Row>
        <Row justify="center" gutter={[8, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          {props.source && props.source === 'importer' ? (
            <Alert
              message="You are not logged in"
              description={
                <div>
                  <p> To resolve this:</p>
                  <ol>
                    <li>Log on to nlmatics in a browser tab or window</li>
                    <li>Refresh this page</li>
                    <li>Re-open this extension</li>
                  </ol>
                </div>
              }
              type="error"
            ></Alert>
          ) : (
            <Button className="narbar--login-button" onClick={getRedirectUrl}>
              Log In
            </Button>
          )}
        </Row>
        <Row justify="center" gutter={[8, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <img
            style={{ width: '100%', marginTop: '40px' }}
            src={loginSplashImage}
          />
        </Row>
        <Row justify="center" gutter={[8, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
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
        </Row>
      </Col>
    </div>
  );
}

// onClick={()=>{getRedirectUrl()}}
