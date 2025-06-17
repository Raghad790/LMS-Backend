import Joi from "joi";

// Course creation validation
export const courseSchema = Joi.object({
  title: Joi.string().min(5).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 2000 characters",
  }),
  price: Joi.number().min(0).precision(2).default(0.0).messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
  }),
  thumbnail_url: Joi.string().uri().allow("").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  category_id: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Category ID must be a number",
    "number.min": "Category ID must be at least 1",
  }),
  is_published: Joi.boolean().default(false),
  is_approved: Joi.boolean().default(false),
  level: Joi.string().valid("beginner", "intermediate", "advanced").required().messages({
    "string.empty": "Level is required",
    "any.only": "Level must be one of 'beginner', 'intermediate', or 'advanced'",
}),
});
// Course update validation (all fields optional, at least one required)
export const courseUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(255).messages({
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(10).max(2000).messages({
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 2000 characters",
  }),
  price: Joi.number().min(0).precision(2).messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
  }),
  thumbnail_url: Joi.string().uri().allow("").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  category_id: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Category ID must be a number",
    "number.min": "Category ID must be at least 1",
  }),
  is_published: Joi.boolean(),
  is_approved: Joi.boolean(),level: Joi.string().valid("beginner", "intermediate", "advanced").messages({
    "any.only": "Level must be one of 'beginner', 'intermediate', or 'advanced'",
  }),
}).min(1); // At least one field required for update
