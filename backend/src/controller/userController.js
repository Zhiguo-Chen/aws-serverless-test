const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, isSeller } = req.body;
    console.log('====');
    console.log(req.body);
    console.log('====');

    const user = await User.create({
      name,
      email,
      phone,
      password,
      isSeller,
    });
    console.log(user);
    res.status(201).json({
      message: 'user registered successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'SECRET_KEY',
      {
        expiresIn: '1h',
      },
    );

    res.status(200).json({
      message: 'user logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in user',
      error,
    });
  }
};

module.exports = {
  register,
  login,
};
