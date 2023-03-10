const mongoose = require("mongoose");
const ClassCommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassComment", ClassCommentSchema);
