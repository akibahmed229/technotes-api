// internal exports
const bcrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;

// external exports
const User = require("../models/User");
const Note = require("../models/Note");

// @desc    Get all users
// @route   GET /users
// @access  Private
const getAllUsers = async (req, res) => {
  // defining users
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  // response
  res.json(users);
};

// @desc    Create new user
// @route   POST /users
// @access  Private
const createNewUser = async (req, res) => {
  // destructure body
  const { username, password, roles } = req.body;

  // confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // create user object
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };

  // create and store user
  const user = await User.create(userObject);

  if (user) {
    // created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc    Update a user
// @route   PATCH /users
// @access  Private
const updateUser = async (req, res) => {
  // destructure body
  const { id, username, roles, active, password } = req.body;

  // confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // find user
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  // update user
  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
};

// @desc    Delete a user
// @route   DELETE /users
// @access  Private
const deleteUser = async (req, res) => {
  // destructure body
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // find user note
  const notes = await Note.find({ user: id }).lean().exec();

  if (notes?.length) {
    res.status(400).json({ message: "User has assigned notes" });
  }

  // define user
  const user = await User.findById(new ObjectId(id)).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // delete user
  const result = await user.deleteOne();

  // message to send
  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
};
// export module
module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
