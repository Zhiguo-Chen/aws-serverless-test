const jwt = require('jsonwebtoken');
const { Customers } = require('../models');

const authenticationToken = async (req, res, next) => {
  console.log('authenticationToken', req.headers);
  const authHeader = req.headers.authorization;
  console.log('authHeader', authHeader);
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  const token = authHeader.split(' ')[1];
  console.log('token', token);
  if (!token) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  try {
    console.log('=========', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    console.log('decoded', decoded);
    const customer = await Customers.findByPk(decoded.id);
    console.log('customer', customer);
    if (!customer) {
      return res.status(403).json({ message: 'can not find customer' });
    }
    req.customer = customer;
    next();
  } catch (err) {
    console.log('err', err);
    return res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = authenticationToken;
