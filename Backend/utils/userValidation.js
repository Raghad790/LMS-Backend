import Joi from "joi";
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .message(
      "Password must contain at least one uppercase, one lowercase, one number and one special character"
    )
    .required(),
  role: Joi.string().valid("student", "instructor", "admin").default("student"),
});
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
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number and one special character",
      "any.invalid": "New password cannot be the same as current password",
    }),
});
export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  email: Joi.string().email(),
  role: Joi.string().valid("student", "instructor", "admin"),
  is_active: Joi.boolean(),
});
