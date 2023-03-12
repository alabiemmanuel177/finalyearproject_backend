const mongoose = require("mongoose");

const AssignmentAnswerSchema = new mongoose.Schema(
  {
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
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentAnswerFile",
      required: true,
    },
    grade: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentAnswer", AssignmentAnswerSchema);
