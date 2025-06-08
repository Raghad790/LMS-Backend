import Joi from "joi";
// --- Submission Validation Schemas ---
export const submissionCreateSchema = Joi.object({
  assignment_id: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Assignment ID must be a number',
      'number.integer': 'Assignment ID must be an integer',
      'number.min': 'Assignment ID must be at least 1',
      'any.required': 'Assignment ID is required'
    }),
  submission_url: Joi.string().uri().required()
    .messages({
      'string.uri': 'Submission URL must be a valid URI',
      'any.required': 'Submission URL is required'
    }),
  comments: Joi.string().allow('').optional()
    .messages({
      'string.base': 'Comments must be a string'
    })
});

export const submissionGradeSchema = Joi.object({
  grade: Joi.number().integer().min(0).max(100).required()
    .messages({
      'number.base': 'Grade must be a number',
      'number.integer': 'Grade must be an integer',
      'number.min': 'Grade cannot be negative',
      'number.max': 'Grade cannot exceed 100',
      'any.required': 'Grade is required'
    }),
  feedback: Joi.string().allow('').optional()
    .messages({
      'string.base': 'Feedback must be a string'
    })
});
