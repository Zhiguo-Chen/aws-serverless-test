const User = require('./User');
const Product = require('./Product');
const Orders = require('./Order');
const Category = require('./Category');
const Cart = require('./Cart');
const Payments = require('./Payment');

User.hasMany(Orders, { foreignKey: 'user_id' });
Orders.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Product, { foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: 'user_id' });

Product.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

Product.belongsToMany(Orders, { through: 'OrderXProduct' });
Orders.belongsToMany(Product, { through: 'OrderXProduct' });

Product.belongsTo(Category, { foreignKey: 'category_id' });

Orders.hasOne(Payments, { foreignKey: 'order_id' });
Payments.belongsTo(Orders, { foreignKey: 'order_id' });

User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

Cart.belongsToMany(Product, { through: 'CartXProduct' });
Product.belongsToMany(Cart, { through: 'CartXProduct' });

module.exports = {
  User,
  Product,
  Orders,
  Category,
  Cart,
  Payments,
};
