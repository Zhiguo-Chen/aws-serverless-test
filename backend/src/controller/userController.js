const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Customers } = require('../models');

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customers.create({
      name,
      email,
      phone,
      password,
    });
    res.status(201).json({
      message: 'Customer registered successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering customer',
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customers.findOne({ where: { email } });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign(
      { id: customer.id },
      process.env.JWT_SECRET || 'SECRET_KEY',
      {
        expiresIn: '1h',
      },
    );

    res.status(200).json({
      message: 'Customer logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in customer',
      error,
    });
  }
};

module.exports = {
  register,
  login,
};
