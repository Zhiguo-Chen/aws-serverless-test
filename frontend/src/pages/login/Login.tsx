import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Flex, Form, Input } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;
const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    console.log(apiUrl);
  }, []);
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/login`, {
        email,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        if (token) {
          localStorage.setItem(authTokenKey, token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          navigate('/main/view-products');
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
    <div className="flex justify-center non-login-container">
      <Card
        style={{ width: '100%', display: 'flex' }}
        className="justify-center"
      >
        <Form
          name="login"
          form={form}
          initialValues={{ remember: true }}
          style={{ maxWidth: 360 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Flex justify="space-between" align="center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a href="">Forgot password</a>
            </Flex>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
            or <a href="/register">Register now!</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
