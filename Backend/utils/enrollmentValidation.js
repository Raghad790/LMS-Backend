import Joi from "joi";

// Validation for creating an enrollment
export const createEnrollmentSchema = Joi.object({
  user_id: Joi.number().integer().min(1).required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.min": "User ID must be at least 1",
    "any.required": "User ID is required",
  }),
  course_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Course ID must be a number",
    "number.integer": "Course ID must be an integer",
    "number.min": "Course ID must be at least 1",
    "any.required": "Course ID is required",
  }),
});

// Validation for updating enrollment progress
export const updateEnrollmentProgressSchema = Joi.object({
  enrollment_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Enrollment ID must be a number",
    "number.integer": "Enrollment ID must be an integer",
    "number.min": "Enrollment ID must be at least 1",
    "any.required": "Enrollment ID is required",
  }),
  progress: Joi.number().min(0).max(100).required().messages({
    "number.base": "Progress must be a number",
    "number.min": "Progress cannot be less than 0",
    "number.max": "Progress cannot be more than 100",
    "any.required": "Progress is required",
  }),
});
