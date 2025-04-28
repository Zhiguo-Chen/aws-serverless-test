// frontend/src/pages/Products/ProductForm.js
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  DatePicker,
  Switch,
  Card,
  Spin,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getProductById,
  createProduct,
  updateProduct,
} from '../../api/products';
import moment from 'moment';
import { getCategories } from '../../api/categories';

const { Option } = Select;
const { TextArea } = Input;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const categories = [
  "Women's Fashion",
  "Men's Fashion",
  'Electronics',
  'Home & Lifestyle',
  'Medicine',
  'Sports & Outdoor',
  "Baby's & Toys",
  'Groceries & Pets',
  'Health & Beauty',
];

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        console.log(data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
    if (isEditMode) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const response = await getProductById(id);
          const product = response.data;
          form.setFieldsValue({
            ...product,
            categoryId: product.categoryId,
            flashSaleEndsAt: product.flashSaleEndsAt
              ? moment(product.flashSaleEndsAt)
              : null,
          });
          setImageUrl(`${API_URL}/public${product.imageUrl}`);
        } catch (error) {
          message.error('Failed to fetch product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, form, isEditMode]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      const selectedCategory: any = categories.find(
        (cat: any) => cat.id === values.categoryId,
      );
      if (selectedCategory) {
        formData.append('category', selectedCategory.name);
      }

      // 添加所有表单字段到FormData
      Object.keys(values).forEach((key) => {
        if (key === 'image' && values[key] && values[key][0]) {
          formData.append('image', values[key][0].originFileObj);
        } else if (key === 'flashSaleEndsAt' && values[key]) {
          formData.append(key, values[key].format('YYYY-MM-DD HH:mm:ss'));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (isEditMode) {
        const response = await updateProduct(id, formData);
        console.log(response);
        message.success('Product updated successfully');
      } else {
        console.log(formData);
        await createProduct(formData);
        message.success('Product created successfully');
      }
      navigate('/management/product-list');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <Card title={isEditMode ? 'Edit Product' : 'Create Product'}>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isFeatured: false,
            isNewArrival: false,
            isFlashSale: false,
            stockQuantity: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please input product name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {categories.map((category: any) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="originalPrice" label="Original Price">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: 'Please input stock quantity!' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="isFeatured"
            label="Featured Product"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isNewArrival"
            label="New Arrival"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isFlashSale"
            label="Flash Sale"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.isFlashSale !== currentValues.isFlashSale
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('isFlashSale') ? (
                <Form.Item
                  name="flashSaleEndsAt"
                  label="Flash Sale End Date"
                  rules={[
                    { required: true, message: 'Please select end date!' },
                  ]}
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="image"
            label="Product Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="image"
              listType="picture"
              maxCount={1}
              beforeUpload={beforeUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>

          {imageUrl && !form.getFieldValue('image') && (
            <div style={{ marginBottom: 16 }}>
              <p>Current Image:</p>
              <img
                src={imageUrl}
                alt="Product"
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </div>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default ProductForm;
