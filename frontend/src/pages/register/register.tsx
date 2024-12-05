import { Button, Card, Form, Input } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

type FieldType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type ErrorFieldType = {
  nameError?: string;
  emailError?: string;
  phoneError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
};

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // set Errors
  const [errors, setErrors] = useState<ErrorFieldType>({});
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    axios
      .post(`${apiUrl}/api/register`, {
        name,
        email,
        phone,
        password,
      })
      .then((res) => console.log(res));
  };

  const validateForm = () => {
    if (password !== confirmPassword) {
      setErrors((prevError) => ({
        ...prevError,
        confirmPasswordError: 'confirm password is not match password',
      }));
      return false;
    }
    return true;
  };

  return (
    <div className="flex justify-center non-login-container">
      <Card
        style={{ width: '100%', display: 'flex' }}
        className="justify-center"
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="User Name"
            name="name"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Item>
          <Form.Item<FieldType>
            label="User Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email' },
            ]}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>

          <Form.Item<FieldType>
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input your phone!' }]}
          >
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="confirmPassword"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          {errors.confirmPasswordError && (
            <span className="warningMsg">{errors.confirmPasswordError}!</span>
          )}
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" className="full-width">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
