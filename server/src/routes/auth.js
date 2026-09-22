import { Router } from 'express'; import { body } from 'express-validator'; import { register,login,me } from '../controllers/authController.js'; import { authenticate } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { authLimiter } from '../middleware/rateLimit.js';
const router=Router();
const email=body('email').isEmail().withMessage('Valid email is required').normalizeEmail();
router.post('/register',authLimiter,[body('name').trim().isLength({min:2,max:80}).withMessage('Name must be 2–80 characters'),email,body('password').isLength({min:8}).withMessage('Password must be at least 8 characters'),body('role').optional().isIn(['hospital_admin','department_manager','doctor','nurse']).withMessage('Invalid role')],validate,register);
router.post('/login',authLimiter,[email,body('password').notEmpty().withMessage('Password is required')],validate,login);
router.get('/me',authenticate,me); export default router;
