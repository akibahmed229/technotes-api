// internal exports
const ObjectId = require("mongoose").Types.ObjectId;

// external exports
const User = require("../models/User");
const Note = require("../models/Note");

// @desc    Get all notes
// @route   GET /notes
// @access  Private
const getAllNotes = async (req, res) => {
  // get all notes from MongoDB
  const notes = await Note.find().lean();

  // if no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  // add username to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
};

// @desc    create a new note
// @route   POST /notes
// @access  Private
const createNewNote = async (req, res) => {
  // destructure body
  const { user, title, text } = req.body;

  // confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate title" });
  }

  const noteObject = {
    user,
    title,
    text,
  };

  // create and store the new note
  const note = await Note.insertMany(noteObject);

  if (note) return res.status(201).json({ message: "New note created" });
  else return res.status(400).json({ message: "Invalid note data received" });
};

// @desc    update a note
// @route   PATCH /notes
// @access  Private
const updateNote = async (req, res) => {
  // destructure body
  const { id, user, title, text, completed } = req.body;

  // confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  // check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // allow renaming of the orginal note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  // update the note
  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
};

// @desc    delete a note
// @route   DELETE /notes
// @access  Private
const deleteNote = async (req, res) => {
  // destructure body
  const { id } = req.body;

  // confirm data
  if (!id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // confirm note exists to delete
  const note = await Note.findById(new ObjectId(id)).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  // delete the note
  const result = await note.deleteOne();
  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

// module exports
module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
