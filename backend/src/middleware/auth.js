import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id).select('-otp');
    
    if (!student) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

