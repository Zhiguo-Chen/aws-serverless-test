const Customers = require("./Customer");
const Products = require("./Product");
const Orders = require("./Order");
const Category = require("./Category");
const Cart = require("./Cart");
const Payments = require("./Payment");

Customers.hasMany(Orders, { foreignKey: "customer_id" });
Orders.belongsTo(Customers, { foreignKey: "customer_id" });

Products.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Products, { foreignKey: "category_id" });

Orders.hasMany(Products, { foreignKey: "order_id" });
Products.belongsTo(Orders, { foreignKey: "order_id" });

Orders.hasOne(Payments, { foreignKey: "order_id" });
Payments.belongsTo(Orders, { foreignKey: "order_id" });

module.exports = {
  Customers,
  Products,
  Orders,
  Category,
  Cart,
  Payments
};
