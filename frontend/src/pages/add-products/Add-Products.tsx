import { Button, Card, Form, Input, InputNumber, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../auth/axiosInstance';

const apiUrl = process.env.REACT_APP_API_URL;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const pic_human =
  'https://lh7-us.googleusercontent.com/4-MRvlvcUzDyLnVX-sESBfjeZG22pRurV2oHL3DCWIWyYgJVO9yzoYYi9tf_Ykpw4hbz0jZD6NazxPkVbHSoJ0gTeebUa9i3Ih9oL5cAyt2FABesXWzzAX4PEDCfrYmRsIBCJVvIc6CusThU-aXfoa1PvIpiUw';

const AddProducts: React.FC = () => {
  const [categories, setCategory] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [image, setImage] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching user info...');
        const response = await axiosInstance.get('/api/get-categories');
        console.log(response.data);
        setCategory(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchData();
  }, []);
  const handleCategoryChange = (value: string) => {
    console.log(`Selected: ${value}`);
  };
  const onReset = () => {
    console.log('Reset');
  };
  const onFill = () => {
    console.log('Fill');
  };
  const handleSubmit = async (values: any) => {
    console.log('Submit', values);
    const data = {
      name,
      price,
      description,
      stock,
      image,
      category_id: selectedCategory,
    };
    console.log(image);
    return;
    console.log(data);
    const response = await axiosInstance.post('/api/add-product', data);
    console.log(response.data);
  };
  return (
    <Card title="Add Products" bordered={false} style={{ width: '100%' }}>
      <Form {...layout} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Pruduct Title"
          rules={[{ required: true }]}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item
          name="categories"
          label="Categories"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select a option and change input text above"
            onChange={setSelectedCategory}
            allowClear
          >
            {categories.map((category: { id: number; name: string }) => {
              return (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            value={price}
            onChange={(e) => setPrice(e || 0)}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="Stock"
          name="stock"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            value={stock}
            onChange={(e) => setStock(e || 0)}
          />
        </Form.Item>
        <Form.Item name="image" label="Image Url" rules={[{ required: true }]}>
          <Input value={image} onChange={(e) => setImage(e.target.value)} />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
            <Button type="link" htmlType="button" onClick={onFill}>
              Fill form
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddProducts;
