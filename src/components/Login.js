import { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Layout, Form, Input, Button, Card, Row, Col, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ExclamationCircleTwoTone,
} from '@ant-design/icons';
import API from '../utils/API.js';
import { useAuth } from '../utils/use-auth.js';
import { useHistory } from 'react-router-dom';
import Navbar from './Navbar.js';

const { Content } = Layout;
const useStyles = makeStyles({
  loginupLayout: {
    height: '100%',
  },

  header: {
    textAlign: 'center',
  },

  loginForm: {
    margin: '0 auto',
    maxWidth: '300px',
  },

  loginFormForget: {
    float: 'left',
  },

  loginFormButton: {
    width: '100%',
  },
});

export default function LoginWrapper() {
  const classes = useStyles();
  let history = useHistory();
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();
  const { signIn, sendPasswordResetEmail, signOut } = useAuth();

  const handleSubmit = async fieldsData => {
    form.resetFields();
    try {
      let loggedInUser = await signIn(fieldsData.email, fieldsData.password);
      console.log('loggedInUser.emailVerified', loggedInUser.emailVerified);
      if (loggedInUser.emailVerified) {
        let res = await API.get(`/user`, {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            emailId: fieldsData.email,
          },
        });
        console.log('res', res);
        await loggedInUser.updateProfile({
          displayName: `${res.data.firstName} ${res.data.lastName}#${res.data.id}`,
        });
        message.info(`Logged in with ${fieldsData.email}`);
        history.push('/workspace');
      } else {
        console.log('loggedInUser here', loggedInUser);
        await loggedInUser.sendEmailVerification();
        message.info(`Verification email sent to ${fieldsData.email}`);
        signOut();
        throw new Error(
          `Your email has to be verified! Check your email at ${email}!`
        );
      }
    } catch (err) {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: err.message,
        duration: 3,
      });
    }
  };

  const resetpassword = async () => {
    try {
      form.resetFields();
      await sendPasswordResetEmail(email);
      message.info(`We sent a reset email to ${email}`);
    } catch (err) {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: err.message,
        duration: 3,
      });
    }
  };

  return (
    <Layout className={classes.loginupLayout}>
      <Navbar />
      <Content style={{ marginTop: '3%' }}>
        <Row>
          <Col offset={8} xs={24} md={16} lg={8}>
            <Card title={<span className="login--text">Log In</span>}>
              <Form
                name="login"
                onFinish={handleSubmit}
                className={classes.loginForm}
                form={form}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                  ]}
                >
                  <Input
                    onChange={e => {
                      setEmail(e.target.value);
                    }}
                    prefix={<UserOutlined className="login--icon" />}
                    placeholder="Email"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your Password!' },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="login--icon" />}
                    type="password"
                    placeholder="Password"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={classes.loginFormButton}
                  >
                    Log in
                  </Button>
                  <Button type="link" onClick={resetpassword}>
                    Forgot password?
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
