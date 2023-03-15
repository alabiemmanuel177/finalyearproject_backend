const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    courseabrev: {
      type: String,
      required: true,
    },
    unit: {
      type: Number,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    lecturer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer",
      },
    ],
  },
  { timestamps: true, collection: "courses" }
);

module.exports = mongoose.model("Course", CourseSchema);
