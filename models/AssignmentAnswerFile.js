const mongoose = require("mongoose");
const AssignmentAnswerFileSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model(
  "AssignmentAnswerFile",
  AssignmentAnswerFileSchema
);
