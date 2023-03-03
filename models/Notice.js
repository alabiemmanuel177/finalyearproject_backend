const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the notice board
const NoticeSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Notice", NoticeSchema);
