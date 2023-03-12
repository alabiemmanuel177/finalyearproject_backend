const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseMaterialFileSchema = new mongoose.Schema(
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

module.exports = mongoose.model("CourseMaterialFile", CourseMaterialFileSchema);
