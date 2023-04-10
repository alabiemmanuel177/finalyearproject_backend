const mongoose = require("mongoose");
const ClassCommentSchema = new mongoose.Schema(
  {
    classPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassPost",
      required: false,
    },
    comment: {
      type: String,
      required: true,
    },
    student_id: {
      type: String,
      required: false,
    },
    lecturer_id: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassComment", ClassCommentSchema);
