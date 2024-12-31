import React from 'react';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import './NewLogin.scss';

const NewLogin: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-image" />

        <div className="login-form-container">
          <div className="form-inner">
            <h1>Log in to Exclusive</h1>
            <p className="subtitle">Enter your details below</p>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="login-form"
            >
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

              <div className="form-actions">
                <Button type="primary" htmlType="submit" className="login-btn">
                  Log In
                </Button>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>
            </Form>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
