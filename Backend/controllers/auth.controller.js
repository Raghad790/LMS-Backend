import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import UserModel from "../models/user.model.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { createResponse, sanitizedUser } from "../utils/helper.js";

// Start Google OAuth flow
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
});

// Handle Google OAuth callback
export const googleCallBack = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user) => {
      if (err) {
        console.error("Google OAuth error: ", err);
        return res.status(500).json({ message: "OAuth error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Not Logged in" });
      }
      try {
        req.login(user, (err) => {
          if (err) {
            console.error("login error", err);
            return res.status(500).json({ message: "Failed to log in" });
          }
          req.session.userId = user.id;
          req.session.authenticated = true;
          const tokenPayload = { id: user.id, email: user.email };
          const accessToken = generateToken(tokenPayload);
          const refreshToken = generateRefreshToken(tokenPayload);
          req.session.save(() => {
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 15* 60 *  1000,//15min
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 30*24 * 60 * 60 * 1000,
            });
            // Redirect to frontend after successful login
            res.redirect(`${process.env.CLIENT_URL}/oauth-redirect`);

          });
        });
      } catch (err) {
        next(err);
      }
    }
  )(req, res, next);
};

export async function register(req, res, next) {
  try {
    const userInfo = { ...req.body };
    const existingUser = await UserModel.findByEmail(userInfo.email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }
    const newUser = await UserModel.createUser(userInfo);

    req.session.userId = newUser.id;
    req.session.authenticated = true;

    req.session.save(() => {
      const accessToken = generateToken({
        id: newUser.id,
        email: newUser.email,
      });
      const refreshToken = generateRefreshToken({
        id: newUser.id,
        email: newUser.email,
      });

      res.cookie("accessToken", accessToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 15 * 60 * 1000,//15min
        sameSite: "lax",
      });
      res.cookie("refreshToken", refreshToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });

      res.json({
        success: true,
        user: sanitizedUser(newUser),
        message: "Registered and logged in",
      });
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const existingUser = await UserModel.findByEmail(email);
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await UserModel.verifyPassword(existingUser, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or password are not correct",
      });
    }

    req.session.userId = existingUser.id;
    req.session.authenticated = true;

    req.session.save(() => {
      const accessToken = generateToken({
        id: existingUser.id,
        email: existingUser.email,
      });
      const refreshToken = generateRefreshToken({
        id: existingUser.id,
        email: existingUser.email,
      });

      res.cookie("accessToken", accessToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "lax",
      });
      res.cookie("refreshToken", refreshToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });

      res.json({
        success: true,
        user: sanitizedUser(existingUser),
        message: "Logged in",
      });
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentLogInInfo(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: sanitizedUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out successfully" });
    }
  } catch (err) {
    next(err);
  }
}
export async function getCurrentUser(req, res) {
  try {
    // Extract the access token from cookies
    const token = req.cookies.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token expired or invalid" });
    }

    // Find the user by ID from the decoded token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Return the sanitized user object
    return res.json({
      success: true,
      user: sanitizedUser(user),
    });
  } catch (error) {
    console.error("Get current user error", error);
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, error.message));
  }
}
export async function changePassword(req, res, next) {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }

    const { currentPassword, newPassword } = value;
    const user = await UserModel.findById(req.user.id);

    const isMatch = await UserModel.verifyPassword(user, currentPassword);
    if (!isMatch) {
      const err = new Error("Current password is incorrect");
      err.status = 401;
      throw err;
    }

    await UserModel.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}
export const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Refresh token required",
            null,
            "no refresh token provided"
          )
        );
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = generateToken({
      id: decoded.id,
      email: decoded.email,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
     maxAge: 15 * 60 * 1000 ,
    });
    return res.json(
      createResponse(true, "Token refreshed", { accessToken: newAccessToken })
    );
  } catch (err) {
    console.error("Can't refresh token", err);
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
};
