const Customers = require('./Customer');
const Product = require('./Product');
const Orders = require('./Order');
const Category = require('./Category');
const Cart = require('./Cart');
const Payments = require('./Payment');

Customers.hasMany(Orders, { foreignKey: 'customer_id' });
Orders.belongsTo(Customers, { foreignKey: 'customer_id' });

Product.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

Orders.hasMany(Product, { foreignKey: 'order_id' });
Product.belongsTo(Orders, { foreignKey: 'order_id' });

Orders.hasOne(Payments, { foreignKey: 'order_id' });
Payments.belongsTo(Orders, { foreignKey: 'order_id' });

module.exports = {
  Customers,
  Product,
  Orders,
  Category,
  Cart,
  Payments,
};
