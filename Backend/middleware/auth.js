// auth.js - improved version
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";

// Main authentication middleware: prioritizes JWT header authentication for API calls
export const authenticate = async (req, res, next) => {
  try {
    console.log("🔒 Authentication attempt");

    // Check Authorization header first (preferred for API calls)
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(" ")[1];
    console.log("Authorization Header Token:", token || "No token provided");
    let authMethod = "jwt-header";

    // If no header token, try cookies
    if (!token) {
      token = req.cookies?.accessToken || req.cookies?.token;
      console.log("Cookie Token:", token || "No token provided");
      authMethod = "jwt-cookie";

      // If no cookie token, check session
      if (!token && req.session?.authenticated && req.session.userId) {
        const sessionUser = await UserModel.findById(req.session.userId);
        if (sessionUser && sessionUser.is_active) {
          console.log(
            `✅ Session authentication successful for user: ${sessionUser.id} (${sessionUser.role})`
          );
          req.user = sessionUser;
          return next();
        }
        authMethod = "session";
      }
    }

    // No token or session found
    if (!token) {
      console.log("❌ Authentication failed: No token or session");
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Authentication required",
            null,
            "No token or session"
          )
        );
    }

    console.log("🔍 Token validation process started");

    // Log token source
    if (authMethod === "jwt-header") {
      console.log("Token Source: Authorization Header");
    } else if (authMethod === "jwt-cookie") {
      console.log("Token Source: Cookies");
    } else if (authMethod === "session") {
      console.log("Token Source: Session");
    }

    // Log token value (masked for security)
    if (token) {
      console.log(
        "Token Value (masked):",
        token.slice(0, 5) + "..." + token.slice(-5)
      );
    } else {
      console.log("No token provided");
    }

    // Verify token and fetch user
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(
        `🔍 Token verification successful: User ID ${decoded.id}, Role: ${
          decoded.role || "unknown"
        }`
      );

      const user = await UserModel.findById(decoded.id);
      if (!user || !user.is_active) {
        console.log(`❌ User not found or inactive: ${decoded.id}`);
        return res
          .status(401)
          .json(
            createResponse(
              false,
              "Invalid or expired token",
              null,
              "User not found or inactive"
            )
          );
      }

      // Authentication successful
      console.log(
        `✅ ${authMethod} authentication successful for: ${user.email} (${user.role})`
      );
      req.user = user;

      // Optional: maintain session for convenience
      if (req.session) {
        req.session.userId = user.id;
        req.session.authenticated = true;
      }

      return next();
    } catch (jwtError) {
      console.error(`❌ JWT verification failed:`, jwtError.message);
      return res
        .status(401)
        .json(createResponse(false, "Invalid token", null, jwtError.message));
    }
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return res
      .status(401)
      .json(
        createResponse(false, "Authentication failed", null, error.message)
      );
  }
};

// Role-based authorization middleware with self-check capability
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Support both JWT and session-based user
    const user = req.user;
    if (!user) {
      console.log("❌ Authorization failed: No user in request");
      return res
        .status(403)
        .json(createResponse(false, "Forbidden: User not authenticated", null));
    }

    // Check if we're allowing 'self' access and if the resource belongs to the user
    const isSelfRequest =
      roles.includes("self") && req.params.id && req.params.id == user.id;

    // Either the user has one of the required roles or it's a valid self-request
    if (roles.length === 0 || roles.includes(user.role) || isSelfRequest) {
      console.log(`✅ Authorization successful: ${user.email} (${user.role})`);
      return next();
    }

    console.log(
      `❌ Authorization failed: User ${user.email} with role ${
        user.role
      } not authorized for ${roles.join(", ")}`
    );
    return res
      .status(403)
      .json(
        createResponse(
          false,
          "Forbidden: insufficient permissions",
          null,
          `Role ${user.role} is not authorized`
        )
      );
  };
};

// Helper to verify a token without requiring it (for public/optional auth routes)
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (user && user.is_active) {
          req.user = user;
          console.log(
            `✅ Optional authentication successful: ${user.email} (${user.role})`
          );
        }
      } catch (error) {
        console.log("Optional authentication: Invalid token");
        // Continue without authentication
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    console.log("Optional authentication: Error occurred");
    next();
  }
};

// import jwt from "jsonwebtoken";
// import UserModel from "../models/user.model.js";
// import { createResponse } from "../utils/helper.js";

// // Main authentication middleware: supports session and JWT (cookie or header)
// export const authenticate = async (req, res, next) => {
//   try {
//     // 1. Check session authentication first
//     if (req.session?.authenticated && req.session.userId) {
//       const user = await UserModel.findById(req.session.userId);
//       if (user && user.is_active) {
//         req.user = user;
//         return next();
//       }
//     }

//     // 2. Check JWT in cookies or Authorization header
//     let token =
//       req.cookies?.accessToken ||
//       req.cookies?.token || // fallback for legacy clients
//       (req.headers.authorization && req.headers.authorization.split(" ")[1]);
//     if (!token) {
//       return res
//         .status(401)
//         .json(createResponse(false, "Authentication required", null, "No token or session"));
//     }

//     // 3. Verify token and fetch user
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await UserModel.findById(decoded.id);
//     if (!user || !user.is_active) {
//       return res
//         .status(401)
//         .json(createResponse(false, "Invalid or expired token", null, "User not found or inactive"));
//     }

//     // Renew session for convenience
//     req.session.userId = user.id;
//     req.session.authenticated = true;
//     req.user = user;
//     next();
//   } catch (error) {
//     return res
//       .status(401)
//       .json(createResponse(false, "Authentication failed", null, error.message));
//   }
// };

// // Role-based authorization middleware
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     // Support both JWT and session-based user
//     const user = req.user || req.session?.user;
//     if (!user || (roles.length && !roles.includes(user.role))) {
//       return res
//         .status(403)
//         .json(
//           createResponse(
//             false,
//             "Forbidden: insufficient permissions",
//             null,
//             `Role ${user?.role || "unknown"} is not authorized`
//           )
//         );
//     }
//     next();
//   };
// };

// // Passport session-based authentication check
// export const isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated && req.isAuthenticated()) {
//     return next();
//   }
//   return res
//     .status(401)
//     .json(
//       createResponse(
//         false,
//         "Authentication required",
//         null,
//         "User not authenticated"
//       )
//     );
// };

// // JWT authentication from Authorization header (Bearer)
// export const authenticateJWT = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) {
//       return res
//         .status(401)
//         .json(createResponse(false, "Access token required", null, "No token provided"));
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await UserModel.findById(decoded.id);
//     if (!user || !user.is_active) {
//       return res
//         .status(401)
//         .json(createResponse(false, "Invalid token", null, "User not found or inactive"));
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     return res
//       .status(403)
//       .json(createResponse(false, "Invalid token", null, error.message));
//   }
// };

// // Optional JWT authentication (doesn't fail if no token)
// export const optionalJWT = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(" ")[1];
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await UserModel.findById(decoded.id);
//       if (user && user.is_active) {
//         req.user = user;
//       }
//     }
//     next();
//   } catch (error) {
//     // Continue without authentication
//     next();
//   }
// };
