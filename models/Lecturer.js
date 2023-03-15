const mongoose = require("mongoose");

const LecturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, collection: "lecturers" }
);

module.exports = mongoose.model("Lecturer", LecturerSchema);
