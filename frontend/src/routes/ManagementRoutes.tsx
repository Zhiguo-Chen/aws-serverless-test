import ManageLayout from '../pages/product-management/manage-layout';
import ProductForm from '../pages/product-management/ProductForm';
import ProductList2 from '../pages/product-management/ProductsList2';

const ManagementRoutes = {
  path: '/management',
  element: <ManageLayout />,
  children: [
    {
      path: 'product-list',
      element: <ProductList2 />,
    },
    {
      path: 'product-list/new',
      element: <ProductForm />,
    },
    {
      path: 'product-list/edit/:id',
      element: <ProductForm />,
    },
  ],
};

export default ManagementRoutes;
