import Joi from "joi";

// Validation for creating a lesson
export const createLessonSchema = Joi.object({
  module_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(255).required(),
  content_type: Joi.string()
    .valid("video", "text", "quiz", "pdf", "audio", "assignment")
    .required(),
  content_url: Joi.string().uri().required(),
  duration: Joi.number().integer().min(1).required(),
  order: Joi.number().integer().min(1).required(),
  is_free: Joi.boolean().required(),
});
// Validation for updating a lesson
export const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  content_type: Joi.string().valid("video", "text", "quiz", "pdf", "audio"),
  content_url: Joi.string().uri(),
  duration: Joi.number().integer().min(1),
  order: Joi.number().integer().min(1),
  is_free: Joi.boolean(),
});
