import Joi from "joi";

// Validation for creating an enrollment
export const createEnrollmentSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  course_id: Joi.number().integer().min(1).required(),
});

// Validation for updating enrollment progress
export const updateEnrollmentProgressSchema = Joi.object({
  enrollment_id: Joi.number().integer().required(),
  progress: Joi.number().min(0).max(100).required(),
});
