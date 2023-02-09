const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignmentQuestion: {
      type: String,
      required: true,
    },
    mark: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    dueTime: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["assigned", "done", "missing"],
      default: "assigned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
