const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseMaterialFile",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseMaterial", courseMaterialSchema);
