// internal imports
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

//  this code provides a function to log messages with a unique identifier and current date and time to a log file in a "logs" directory.
const logEvents = async (message, logFileName) => {
  // formating
  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // if file direcotry does not exist, createin it
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(fs.existsSync(path.join(__dirname, "..", "logs")));
    }
    // if exist opeing that directory
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

// logger middleware function to log every request
const logger = (req, res, next) => {
  // log every request comes in
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, `reqLog.log`);

  console.log(`${req.method} ${req.path}`);
  next();
};

// exporting module
module.exports = { logEvents, logger };
