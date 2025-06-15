import UserModel from "../models/user.model.js";
import { updateUserSchema } from "../utils/userValidation.js";
import bcrypt from "bcryptjs";
import { createResponse } from "../utils/helper.js";


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

// Get user by ID
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

// Create user (with Google OAuth support)
export const createUser = async (req, res, next) => {
  try {
    const userInfo = { ...req.body };
    if (userInfo.oauth_provider === "google" && userInfo.oauth_id) {
      userInfo.password = null;
      userInfo.avatar = userInfo.avatar || null;
    } else {
      userInfo.oauth_provider = null;
      userInfo.oauth_id = null;
      userInfo.avatar = userInfo.avatar || null;
    }
    const created = await UserModel.createUser(userInfo);
    res.status(201).json({ success: true, user: created });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};

// Update user (admin can update any user, users can update themselves)
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

// Delete user (admin only, soft delete)
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

// Change user password
export const changeUserPassword = async (req, res, next) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }
    const updatedUser = await UserModel.changeUserPassword({
      user_id: user.id,
      newPassword,
    });
    if (!updatedUser) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update password" });
    }
    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};

// Get user by email
export const getUserByEmail = async (req, res, next) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }
  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, user });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};

// Get user by Google ID
export const getUserByGoogleId = async (req, res, next) => {
  const id = req.params.oauth_id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Google ID is required" });
  }
  try {
    const user = await UserModel.getUserbyGoogleId(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // ✅ Only allow admins
    if (req.user.role !== "admin") {
      return res.status(403).json(createResponse(false, "Forbidden"));
    }

    const validRoles = ["student", "instructor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json(createResponse(false, "Invalid role"));
    }

    const updated = await UserModel.updateRole(id, role);

    if (!updated) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    return res.json(createResponse(true, "Role updated successfully"));
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json(createResponse(false, "Server error", null, error.message));
  }
};