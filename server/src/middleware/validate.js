import { validationResult } from 'express-validator'; import { ApiError } from '../utils/apiError.js';
export function validate(req,res,next){const errors=validationResult(req);if(!errors.isEmpty())return next(new ApiError(400,'Request validation failed',errors.array().map(e=>({field:e.path,message:e.msg}))));next()}
