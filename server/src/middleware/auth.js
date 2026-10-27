import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new ApiError(401, 'Authentication required'));

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return next(new ApiError(500, 'Server JWT configuration is invalid'));

  let payload;
  try {
    payload = jwt.verify(header.slice(7), secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return next(new ApiError(401, 'Invalid or expired token'));
    return next(error);
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string' || !mongoose.isValidObjectId(payload.sub)) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  const user = await User.findById(payload.sub).select('-password');
  if (!user || !user.active) return next(new ApiError(401, 'Invalid or expired token'));

  req.user = user;
  return next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action'));
    return next();
  };
}
