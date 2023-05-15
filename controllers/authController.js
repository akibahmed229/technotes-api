// internal exports
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// external exports
const User = require("../models/User");

// @desc    Login
// @route   POST /auth
// @access  Public
const login = async (req, res) => {
  // drestruct body
  const { username, password } = req.body;

  // if we don't recive user data
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  // searching user from database
  const foundUser = await User.findOne({ username }).exec();

  // if user not exist
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // if user exist then matching password
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  // if user exist and password match then create token
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // acess only by web server
    secure: true, // https
    sameSite: "None", // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match refresh token
  });

  // send accessToken containing username and roles
  res.json({ accessToken });
};

// @desc    Refresh
// @route   GET /auth/refresh
// @access  Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  // jwt dependency to varify this token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      // searching user from database
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.json({ accessToken });
    }
  );
};

// @desc    Logout
// @route   POST /auth/logout
// @access  Public - just to clear cookie if exist
const logout = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No content

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); // secure: true - https
  
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
