const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
});

const courseMaterialSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    files: [fileSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseMaterial", courseMaterialSchema);
