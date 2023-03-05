const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the notice board
const NoticeSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "authorType"
    },
    authorType: {
      type: String,
      required: true,
      enum: ["Admin", "Lecturer"]
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Notice", NoticeSchema);
