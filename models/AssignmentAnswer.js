const mongoose = require("mongoose");

const AssignmentAnswerSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
    assignmentAnswer: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentAnswer", AssignmentAnswerSchema);
