import { ApiError, asyncHandler } from '../utils/apiError.js';
export const makeCrud=(Model,opts={})=>({
 list:asyncHandler(async(req,res)=>{const {page=1,limit=50,search}=req.query;const filter=search&&opts.searchFields?.length?{$or:opts.searchFields.map(f=>({[f]:{$regex:search,$options:'i'}}))}:{};const data=await Model.find(filter).sort({createdAt:-1}).limit(Math.min(Number(limit),100)).skip((Number(page)-1)*Number(limit));const total=await Model.countDocuments(filter);res.json({success:true,data,pagination:{page:Number(page),limit:Number(limit),total,totalPages:Math.ceil(total/Number(limit))}})}),
 get:asyncHandler(async(req,res)=>{const item=await Model.findById(req.params.id);if(!item)throw new ApiError(404,`${Model.modelName} not found`);res.json({success:true,data:item})}),
 create:asyncHandler(async(req,res)=>{const item=await Model.create(req.body);res.status(201).json({success:true,message:`${Model.modelName} created`,data:item})}),
 update:asyncHandler(async(req,res)=>{const item=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!item)throw new ApiError(404,`${Model.modelName} not found`);res.json({success:true,message:`${Model.modelName} updated`,data:item})}),
 remove:asyncHandler(async(req,res)=>{const item=await Model.findByIdAndDelete(req.params.id);if(!item)throw new ApiError(404,`${Model.modelName} not found`);res.json({success:true,message:`${Model.modelName} deleted`})})
});
