import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './NewLogin.scss';
import axios from 'axios';
import CenterContainer from '../../components/center-container/CenterContainer';

const apiUrl = process.env.REACT_APP_API_URL;
const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const NewLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async () => {
    console.log('email', email);
    console.log('password', password);
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/api/login`, {
        email,
        password,
      });
      if (response.status === 200) {
        const { token, user } = response.data;
        if (token) {
          localStorage.setItem(authTokenKey, token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        if (user.isSeller) {
          navigate('/management/product-list');
        } else {
          navigate('/main/home');
        }
      } else {
        console.log('Login failed:');
        setEmail('');
        setPassword('');
      }
      console.log(response);
    } catch (error) {
      console.error('Login failed:', error);
      form.setFieldsValue({ username: '', password: '' });
    }
  };

  return (
    <CenterContainer>
      <div className="login-container">
        <div className="login-content">
          <div className="login-image" />

          <div className="login-form-container">
            <div className="form-inner">
              <h1>Log in to My E-commerce</h1>
              <p className="subtitle">Enter your details below</p>

              <Form
                name="login"
                onFinish={handleSubmit}
                form={form}
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
                  <Input
                    placeholder="Email or Phone Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                  ]}
                >
                  <Input.Password
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>

                <div className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-btn"
                  >
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
    </CenterContainer>
  );
};

export default NewLogin;
