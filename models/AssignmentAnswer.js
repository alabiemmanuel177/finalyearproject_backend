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

const AssignmentAnswerFileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["document", "slide", "sheet", "drawing", "pdf"],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentAnswer", AssignmentAnswerSchema);
