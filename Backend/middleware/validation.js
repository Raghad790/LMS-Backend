import { body, validationResult } from "express-validator";
import { createResponse } from "../utils/helper.js";

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(createResponse(false, "Validation failed", null, errors.array()));
  }
  next();
};

// User profile validation
export const validateUserProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

export function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json(createResponse(false, "Validation failed", null, error.details[0].message));
    }
    next();
  };
}