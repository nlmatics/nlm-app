import { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import API from '../utils/API.js';
import firebase from 'firebase/app';
import { Layout, Form, Input, Button, Card, Row, Col, message } from 'antd';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import { useAuth } from '../utils/use-auth.js';
import { useHistory } from 'react-router-dom';
import Navbar from './Navbar.js';

const { Content } = Layout;
const useStyles = makeStyles({
  signupLayout: {},
  header: {
    textAlign: 'center',
  },

  signupForm: {
    margin: '0 auto',
    maxWidth: '400px',
  },

  signupFormForget: {
    float: 'right',
  },

  signupFormButton: {
    width: '100%',
  },
});

export default function Signup() {
  const classes = useStyles();
  const [confirmDirty, setConfirmDirty] = useState(false);
  let history = useHistory();
  const [form] = Form.useForm();
  const { signUp } = useAuth();

  const handleSubmit = async fieldsData => {
    let newUser = null;
    form.resetFields();
    try {
      await signUp(fieldsData.email, fieldsData.password);
      newUser = firebase.auth().currentUser;
      console.log('user is ', newUser);
      await newUser.sendEmailVerification();
      history.push('/login');
      message.info(`Verification email sent to ${fieldsData.email}`);
      // message.info(`Succesfully signed up with ${fieldsData.email}`);
      await API.post(
        `/user`,
        {
          emailId: fieldsData.email,
          firstName: fieldsData.firstname,
          lastName: fieldsData.lastname,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      if (err.code === 'PERMISSION_DENIED') {
        newUser.delete();
        message.error({
          icon: (
            <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
          ),
          content:
            'Sorry, your email already exists. Please use another email.',
          duration: 3,
        });
      } else {
        console.log(err);
        message.error({
          icon: (
            <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
          ),
          content: err.message,
          duration: 3,
        });
      }
    }
  };

  const handleConfirmBlur = e => {
    const { value } = e.target;
    setConfirmDirty(confirmDirty || !!value);
    // this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 10 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 10,
      },
    },
  };

  return (
    <Layout className={classes.signupLayout}>
      <Navbar />
      <Content style={{ marginTop: '3%' }}>
        <Row>
          <Col offset={8} xs={24} md={16} lg={8}>
            <Card title={<span style={{ fontSize: '30px' }}>Sign Up</span>}>
              <Form
                name="register"
                form={form}
                {...formItemLayout}
                onFinish={handleSubmit}
                className={classes.signupForm}
                scrollToFirstError
              >
                <Form.Item
                  name="email"
                  label="E-mail"
                  rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password"
                  hasFeedback
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  hasFeedback
                  name="confirm"
                  dependencies={['password']}
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          'The two passwords that you entered do not match!'
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password onBlur={handleConfirmBlur} />
                </Form.Item>
                <Form.Item
                  label={<span>First Name&nbsp;</span>}
                  name="firstname"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your first name!',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={<span>Last Name&nbsp;</span>}
                  name="lastname"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your lastname!',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit">
                    Register
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
