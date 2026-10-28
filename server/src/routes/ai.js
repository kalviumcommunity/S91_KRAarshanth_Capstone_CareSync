import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/apiError.js';
import { completeDepartmentSpecialty } from '../utils/aiAutocomplete.js';

const router = Router();

router.post(
  '/autocomplete',
  authenticate,
  authorize('super_admin', 'hospital_admin', 'department_manager'),
  aiLimiter,
  [
    body('departmentName').isString().trim().isLength({ min: 1, max: 80 }).withMessage('Department name must be 1–80 characters'),
    body('prefix').optional().isString().trim().isLength({ max: 200 }).withMessage('Specialty prefix must be at most 200 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const suggestion = await completeDepartmentSpecialty({
      departmentName: req.body.departmentName,
      prefix: req.body.prefix ?? '',
    });

    res.json({ success: true, suggestion });
  }),
);

export default router;
