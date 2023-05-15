// internal exports
const express = require("express");
const router = express.Router();

// external imports
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

// routes for users api call
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

// export router
module.exports = router;
