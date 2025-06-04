import UserModel from "../models/user.model.js";
import { updateUserSchema } from "../utils/userValidation.js";
// Get all users (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};
//Get user by ID
export const getUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      const err = new Error("User not Found");
      err.status = 404;
      throw err;
    }
    res.json({ success: true, user });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};
//Update user(admin can update any user, users can update themselves)
export const updateUser = async (req, res, next) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    // Admins can update any user, users can only update themselves
    if (req.user.role !== "admin" && req.user.id !== parseInt(req.params.id)) {
      const err = new Error("Unauthorized");
      err.status = 403;
      throw err;
    }
    const updated = await UserModel.updateUser(req.params.id, value);
    if (!updated) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json({ success: true, user: updated });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};

//Delete user(admin only,soft delete)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      const err = new Error("Unauthorized");
      err.status = 403;
      throw err;
    }
    const deleted = await UserModel.deleteUser(req.params.id);
    if (!deleted) {
      const err = new Error("User not Found");
      err.status = 404;
      throw err;
    }
    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};
