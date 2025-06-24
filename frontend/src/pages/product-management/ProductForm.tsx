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
  Radio,
} from 'antd';
import { DeleteOutlined, UploadOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getProductById,
  createProduct,
  updateProduct,
} from '../../api/products';
import moment from 'moment';
import { getCategories } from '../../api/categories';
import './ProductForm.scss';

const { Option } = Select;
const { TextArea } = Input;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const ProductForm = () => {
  const [_, forceUpdate] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(
    null,
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

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
          let primaryIdx: number | null = null;
          const formattedImages = product.productImages.map(
            (img: any, index: number) => {
              if (img.isPrimary) {
                primaryIdx = index;
              }
              return {
                ...img, // Keep original data
                uid: img.id,
                name: img.imageUrl.split('/').pop(),
                status: 'done',
                url: `${API_URL}/public${img.imageUrl}`,
              };
            },
          );
          if (primaryIdx !== null) {
            setPrimaryImageIndex(primaryIdx);
          }
          form.setFieldsValue({
            ...product,
            categoryId: product.categoryId,
            flashSaleEndsAt: product.flashSaleEndsAt
              ? moment(product.flashSaleEndsAt)
              : null,
            image: formattedImages,
          });
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

      // Handle images
      const imagesMeta: any[] = [];
      (values.image || []).forEach((file: any, idx: number) => {
        if (file.originFileObj) {
          // New file
          formData.append(
            'images',
            file.originFileObj,
            file.originFileObj.name,
          );
          imagesMeta.push({
            fileName: file.name,
            isPrimary: idx === primaryImageIndex,
            isNew: true,
          });
        } else {
          // Existing file
          imagesMeta.push({
            id: file.id,
            isPrimary: idx === primaryImageIndex,
            isNew: false,
          });
        }
      });
      formData.append('imagesMeta', JSON.stringify(imagesMeta));

      if (isEditMode && deletedImageIds.length > 0) {
        formData.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }

      // Other fields
      Object.keys(values).forEach((key) => {
        if (key === 'image') return; // 已处理
        if (key === 'flashSaleEndsAt' && values[key]) {
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
            label="Product Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: 'Please upload at least one image!' },
            ]}
          >
            <Upload
              name="image"
              listType="picture"
              multiple
              beforeUpload={beforeUpload}
              accept="image/*"
              showUploadList={false} // 不用默认的列表
              onChange={({ fileList }) => {
                const currentImages = form.getFieldValue('image') || [];
                const newImages = fileList.map((file) => {
                  if (file.originFileObj && !file.thumbUrl) {
                    file.thumbUrl = URL.createObjectURL(file.originFileObj);
                  }
                  return file;
                });

                // Combine existing images with newly uploaded ones
                const allImages = [...currentImages, ...newImages];

                // Remove duplicates by 'uid'
                const uniqueImages = allImages.filter(
                  (file, index, self) =>
                    index === self.findIndex((f) => f.uid === file.uid),
                );

                if (
                  primaryImageIndex !== null &&
                  uniqueImages[primaryImageIndex] === undefined
                ) {
                  setPrimaryImageIndex(null);
                }

                form.setFieldsValue({ image: uniqueImages });
                // force re-render to show preview
                forceUpdate({});
              }}
              customRequest={({ file, onSuccess }) => {
                // 仅本地预览，不上传
                setTimeout(() => {
                  onSuccess && onSuccess('ok');
                }, 0);
              }}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
            {/* 自定义图片预览 */}
            <div className="custom-upload-list">
              {console.log('当前fileList', form.getFieldValue('image'))}
              {(form.getFieldValue('image') || []).map(
                (file: any, idx: number) => {
                  const isSelected = primaryImageIndex === idx;
                  return (
                    <div
                      className={`custom-upload-item${
                        isSelected ? ' selected' : ''
                      }`}
                      key={file.uid || file.id}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={
                            file.thumbUrl ||
                            file.url ||
                            `${API_URL}/public${file.imageUrl}`
                          }
                          alt={file.name}
                          className="custom-upload-thumb"
                          onClick={() => setPrimaryImageIndex(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                        {isSelected && <StarFilled className="primary-icon" />}
                        <span
                          className="custom-upload-delete"
                          onClick={() => {
                            const imageList = form.getFieldValue('image') || [];
                            const fileToRemove = imageList[idx];

                            if (fileToRemove.id) {
                              // This is an existing image from the backend
                              setDeletedImageIds((prev) => [
                                ...prev,
                                fileToRemove.id,
                              ]);
                            }

                            const newList = imageList.filter(
                              (_: any, i: number) => i !== idx,
                            );
                            form.setFieldsValue({ image: newList });
                            if (primaryImageIndex === idx)
                              setPrimaryImageIndex(null);
                            else if (
                              primaryImageIndex &&
                              primaryImageIndex > idx
                            )
                              setPrimaryImageIndex(primaryImageIndex - 1);
                            forceUpdate({});
                          }}
                        >
                          <DeleteOutlined />
                        </span>
                      </div>
                      <Radio
                        checked={isSelected}
                        onChange={() => setPrimaryImageIndex(idx)}
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </Form.Item>

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
