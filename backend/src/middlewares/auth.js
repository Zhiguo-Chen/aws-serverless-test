import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const authenticationToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    const user = await db.User.findByPk(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'can not find user' });
    }
    req.user = user ? user.get({ plain: true }) : null;
    next();
  } catch (err) {
    console.log('err', err);
    return res.status(401).json({ message: 'Token invalid' });
  }
};

export default authenticationToken;
