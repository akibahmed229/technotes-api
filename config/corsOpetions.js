// external imports
const allowedOrigins = require("./allowedOrigins");

// this code defines a configuration object for CORS middleware that restricts the origins of incoming requests to those listed in allowedOrigins, and allows sending cookies across different domains.
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
