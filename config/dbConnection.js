// internal imports
const mongoose = require("mongoose");

// connecting to db using mongoose
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// exporting the connection
module.exports = connectDB;
