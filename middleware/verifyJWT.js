// internal imports
const jwt = require("jsonwebtoken");

// This code defines a middleware function that verifies a JWT sent in the authorization header of a request and adds the decoded user information to the request object. If there is an error, it returns a 403 Forbidden response.
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // If there is no auth header, return a 401 Unauthorized response.
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token value from the authorization header by splitting it and assign it to the token variable.
  const token = authHeader.split(" ")[1];

  // verify the token using the ACCESS_TOKEN_SECRET environment variable and assign the decoded user information to the request object. If there is an error, it returns a 403 Forbidden response.
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
