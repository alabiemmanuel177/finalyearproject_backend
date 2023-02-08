const mongoose = require("mongoose");

const ClassPostSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassComment",
      required: false,
    },
    student_id: {
      type: String,
      required: false,
    },
    lecturer_id: {
      type: String,
      required: false,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassPost", ClassPostSchema);
