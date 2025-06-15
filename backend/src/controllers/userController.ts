import jwt from 'jsonwebtoken';
// Try to install type definitions first. If that doesn't work, use the declare statement in a .d.ts file.
// For now, you can suppress the type error if you are sure about the usage.
// @ts-ignore
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { Request, Response } from 'express';

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, isSeller } = req.body;

    const user = await User.create({
      name,
      email,
      phone,
      password,
      isSeller,
    } as User);
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

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: 'user not found' });
      return;
    }

    const hash =
      user.password ||
      user.getDataValue('password') ||
      user.dataValues.password;

    const isPasswordValid = await bcrypt.compare(password, hash);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
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
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in user',
      error,
    });
  }
};

export { register, login };
