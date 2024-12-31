import React from 'react';
import { Form, Input, Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import beatsnoop from '../../assets/images/beatsnoop.png';
import { ReactComponent as GoogleIcon } from '../../assets/icons/Icon-Google.svg';
import './SignUp.scss';

const SignUp: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-image" />

        <div className="signup-form-container">
          <div className="signup-form-content">
            <h1>Create an account</h1>
            <p className="subtitle">Enter your details below</p>

            <Form
              name="signup"
              onFinish={onFinish}
              layout="vertical"
              className="signup-form"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input placeholder="Name" />
              </Form.Item>

              <Form.Item
                name="emailOrPhone"
                rules={[
                  {
                    required: true,
                    message: 'Please input your email or phone number!',
                  },
                ]}
              >
                <Input placeholder="Email or Phone Number" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="create-account-btn"
                >
                  Create Account
                </Button>
              </Form.Item>

              <Form.Item>
                <Button className="google-btn">
                  <GoogleIcon />
                  Sign up with Google
                </Button>
              </Form.Item>

              <div className="login-link">
                Already have account? <Link to="/main/new-login">Log in</Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
