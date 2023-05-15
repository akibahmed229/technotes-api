// internal exports
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// external imports
const { logEvents, logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOpetions");
const connectDB = require("./config/dbConnection");

const PORT = process.env.PORT || 3600;

// connect to database with mongoose
connectDB();

// using logger middleware
app.use(logger);

// using cors middleware for specific origine and options
app.use(cors(corsOptions));

// request parser
app.use(express.json());

// parse cookie from request
app.use(cookieParser());

// set static folder to serve static files
app.use("/", express.static(path.join(__dirname, "public")));

// API routes handlers and middlewares
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

// 404 not found handler
app.use("*", (req, res) => {
  res.status(404);

  // check if client accepts html
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found!!" });
  } else {
    res.type("txt").send("404 Not Found!!");
  }
});

//  error handler
app.use(errorHandler);

// server connection to DB success event and start server listening
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
});

// server connection to DB error event and log error
mongoose.connection.on("error", (err) => {
  console.log(err);

  // log every request comes in
  logEvents(
    `${err.no}:  ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
