const mongoose = require("mongoose");

const GroupPostSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: false,
    },
    lecturer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: false,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupMaterialFile",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupPost", GroupPostSchema);
