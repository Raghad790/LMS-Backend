import Joi from "joi";
//Validation for creating a module
export const createModuleSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).allow(""),
  order: Joi.number().integer().min(1).required(),
});

//Validation for updating a module

export const updateModuleSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  description: Joi.string().allow("").max(1000),
  order: Joi.number().integer().min(1),
});
