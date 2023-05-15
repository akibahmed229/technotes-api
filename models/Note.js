// internal imports
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// creating schema for notes
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// creating ticket number
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

// creating model and export it
module.exports = mongoose.model("Note", noteSchema);
