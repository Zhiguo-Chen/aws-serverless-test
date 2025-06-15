import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Request, Response, NextFunction } from 'express';

const authenticationToken = async (req: Request | any, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(403).json({ message: 'can not find user' });
      return;
    }
    req.user = user ? user.get({ plain: true }) : null;
    next();
  } catch (err) {
    console.log('err', err);
    res.status(401).json({ message: 'Token invalid' });
    return;
  }
};

export default authenticationToken;
