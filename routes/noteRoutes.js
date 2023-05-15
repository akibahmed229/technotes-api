// internal exports
const express = require("express");
const router = express.Router();

// external exports
const notesController = require("../controllers/notesController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

// routes for notes api call
router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

// export router
module.exports = router;
