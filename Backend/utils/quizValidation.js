import Joi from "joi";

// Quiz validation


// --- Quiz Validation Schemas ---
export const quizCreateSchema = Joi.object({
  lesson_id: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Lesson ID must be a number',
      'number.integer': 'Lesson ID must be an integer',
      'number.min': 'Lesson ID must be at least 1',
      'any.required': 'Lesson ID is required'
    }),
  question: Joi.string().min(5).required()
    .messages({
      'string.base': 'Question must be a string',
      'string.min': 'Question must be at least 5 characters',
      'any.required': 'Question is required'
    }),
  options: Joi.array().items(
    Joi.string().min(1)
  ).min(2).required()
    .messages({
      'array.base': 'Options must be an array',
      'array.min': 'At least 2 options are required',
      'string.min': 'Option text cannot be empty',
      'any.required': 'Options are required'
    }),
  correct_answer: Joi.string().required()
    .messages({
      'string.base': 'Correct answer must be a string',
      'any.required': 'Correct answer is required'
    }),
  max_score: Joi.number().integer().min(1).default(10)
    .messages({
      'number.base': 'Max score must be a number',
      'number.integer': 'Max score must be an integer',
      'number.min': 'Max score must be at least 1'
    })
});

export const quizUpdateSchema = Joi.object({
  question: Joi.string().min(5)
    .messages({
      'string.base': 'Question must be a string',
      'string.min': 'Question must be at least 5 characters'
    }),
  options: Joi.array().items(
    Joi.string().min(1)
  ).min(2)
    .messages({
      'array.base': 'Options must be an array',
      'array.min': 'At least 2 options are required',
      'string.min': 'Option text cannot be empty'
    }),
  correct_answer: Joi.string()
    .messages({
      'string.base': 'Correct answer must be a string'
    }),
  max_score: Joi.number().integer().min(1)
    .messages({
      'number.base': 'Max score must be a number',
      'number.integer': 'Max score must be an integer',
      'number.min': 'Max score must be at least 1'
    })
}).min(1); // At least one field required for update

export const quizSubmissionSchema = Joi.object({
  answers: Joi.array().items(
    Joi.string().min(1)
  ).required()
    .messages({
      'array.base': 'Answers must be an array',
      'string.min': 'Answer cannot be empty',
      'any.required': 'Answers are required'
    })
});