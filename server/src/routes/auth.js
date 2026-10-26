import { Router } from 'express';
import { body, param } from 'express-validator';
import { register, login, googleLogin, me, assignRole } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/apiError.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const email = body('email').isEmail().withMessage('Valid email is required').normalizeEmail();
const registrationFieldsOnly = (req, res, next) => {
  const allowed = ['name', 'email', 'password'];
  const unknown = Object.keys(req.body || {}).filter((key) => !allowed.includes(key));
  if (unknown.length) return next(new ApiError(400, `Unsupported registration field(s): ${unknown.join(', ')}. Roles are assigned by an administrator.`));
  next();
};
router.post('/register', authLimiter, registrationFieldsOnly, [body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'), email, body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')], validate, register);
router.post('/login', authLimiter, [email, body('password').isString().notEmpty().withMessage('Password is required')], validate, login);
router.post('/google', authLimiter, [body('credential').isString().isLength({ min: 1, max: 8192 }).withMessage('Google credential is required')], validate, googleLogin);
router.get('/me', authenticate, me);
router.patch('/users/:id/role', authenticate, authorize('super_admin', 'hospital_admin'), [param('id').isMongoId().withMessage('Invalid user id'), body('role').isIn(['super_admin', 'hospital_admin', 'department_manager', 'doctor', 'nurse']).withMessage('Invalid role')], validate, assignRole);
export default router;
