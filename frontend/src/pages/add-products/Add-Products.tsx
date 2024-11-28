import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const AddProducts: React.FC = () => {
  const [categories, setCategory] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching user info...');
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No token found');
          return;
        }

        const response = await axios.get(`${apiUrl}/api/get-categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);

        setCategory(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
        // alert('Failed to fetch user info');
      }
    };

    fetchData();
  }, []);
  return (
    <Card title="Add Products" bordered={false} style={{ width: '100%' }}>
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
  );
};

export default AddProducts;
