const mongoose = require("mongoose");

const AssignmentAnswerSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  answerText: {
    type: String,
    required: true,
  },
  answerType: {
    type: String,
    enum: ["text", "file"],
    required: true,
  },
  answerFile: {
    type: String,
  },
  grade: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AssignmentAnswer", AssignmentAnswerSchema);
