import Joi from "joi";
// Unified user creation/registration schema
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 255 characters",
  }),
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Must be a valid email address",
    "string.empty": "Email is required",
    "string.max": "Email cannot exceed 255 characters",
  }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 100 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase, lowercase, number, and special character",
    }),
  role: Joi.string()
    .valid("student", "instructor", "admin")
    .default("student")
    .messages({
      "any.only": "Role must be student, instructor, or admin",
    }),
  avatar: Joi.string().uri().max(500).optional().messages({
    "string.uri": "Avatar must be a valid URL",
    "string.max": "Avatar URL cannot exceed 500 characters",
  }),
  oauth_provider: Joi.string().optional(),
  oauth_id: Joi.string().optional(),
  is_active: Joi.boolean().default(true), // For admin-created users
}).with("oauth_provider", "oauth_id");

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .invalid(Joi.ref("currentPassword")) // Alternative to disallow(new password same as current password)
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters",
      "string.max": "New password cannot exceed 100 characters",
      "string.pattern.base":
        "New password must contain at least one uppercase, lowercase, number, and special character",
      "any.invalid": "New password cannot be the same as current password",
    }),
});
export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 255 characters",
  }),
  email: Joi.string().email().messages({
    "string.email": "Must be a valid email address",
    "string.max": "Email cannot exceed 255 characters",
  }),
  role: Joi.string().valid("student", "instructor", "admin").messages({
    "any.only": "Role must be student, instructor, or admin",
  }),
  is_active: Joi.boolean(),
  avatar: Joi.string().uri().max(500).allow(null).messages({
    "string.uri": "Avatar must be a valid URL",
    "string.max": "Avatar URL cannot exceed 500 characters",
  }),
}).min(1); // At least one field is required for update
