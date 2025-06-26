import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import beatsnoop from '../../assets/images/beatsnoop.png';
import { ReactComponent as GoogleIcon } from '../../assets/icons/Icon-Google.svg';
import './SignUp.scss';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    console.log('values', values);
    try {
      const response = await axios.post(`${apiUrl}/api/register`, values);
      if (response.status === 201) {
        navigate('/main/login');
      } else {
        console.log('Login failed:');
      }
      console.log(response);
    } catch (error) {
      console.error('Login failed:', error);
      form.setFieldsValue({
        name: '',
        password: '',
        email: '',
        phone: '',
        isSeller: false,
      });
    }
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
              form={form}
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
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: 'Please input your phone number!',
                  },
                ]}
              >
                <Input placeholder="Phone Number" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item name="isSeller" valuePropName="checked">
                <Checkbox>Register as Seller</Checkbox>
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
                Already have account? <Link to="/main/login">Log in</Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
