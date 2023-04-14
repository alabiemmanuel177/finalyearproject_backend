const mongoose = require("mongoose");

const GroupCommentSchema = new mongoose.Schema(
  {
    groupPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groupPost",
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

module.exports = mongoose.model("GroupComment", GroupCommentSchema);
