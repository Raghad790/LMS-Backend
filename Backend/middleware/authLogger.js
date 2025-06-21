const authLogger = (req, res, next) => {
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  console.log(
    "Authorization Header:",
    req.headers.authorization || "No token provided"
  );

  if (req.user) {
    console.log("Authenticated User ID:", req.user.id);
    console.log("Authenticated User Role:", req.user.role);
  } else {
    console.log("No authenticated user found.");
  }

  next();
};

export default authLogger;
