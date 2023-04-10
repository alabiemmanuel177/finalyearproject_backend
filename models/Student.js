const mongoose = require("mongoose");
const StudentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    middlename: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    level: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    matricno: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    profilePic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfilePic",
    },
  },
  { timestamps: true, collection: "students" }
);

module.exports = mongoose.model("Student", StudentSchema);
