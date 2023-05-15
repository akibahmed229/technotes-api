// external imports
const { logEvents } = require("./logger");

// errorHandler is a middleware function for handling errors in Express.js. It logs incoming requests with error messages and stack traces, sends JSON responses with error messages and sets isError to true.
const errorHandler = (err, req, res, next) => {
  // log every request comes in
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}}`,
    "errLog.log"
  );
  console.log(err.stack);

  const status = res.statusCode ? res.statusCode : 500; // server error

  res.status(status);
  res.json({ message: err.message, isError: true });
};

// exporting module
module.exports = errorHandler;
