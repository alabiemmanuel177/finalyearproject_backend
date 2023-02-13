const mongoose = require("mongoose");

const AssignmentAnswerSchema = new mongoose.Schema({
  assignmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
  },
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["turned in late", "done", "missing"],
  },
  graded: {
    type: Boolean,
    default: false,
  },
  grade: {
    type: Number,
  },
});

module.exports = mongoose.model("AssignmentAnswer", AssignmentAnswerSchema);
