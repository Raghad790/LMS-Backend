import Joi from "joi";
export const courseSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().min(0).precision(2).default(0.0),
  thumbnail_url: Joi.string().uri().allow(""),
  category_id: Joi.number().integer().min(1).allow(null),
  is_published: Joi.boolean().default(false),
});

export const courseUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(255),
  description: Joi.string().min(10).max(2000),
  price: Joi.number().min(0).precision(2),
  thumbnail_url: Joi.string().uri().allow(""),
  category_id: Joi.number().integer().min(1).allow(null),
  is_published: Joi.boolean(),
}).min(1); //At least one field required for update
