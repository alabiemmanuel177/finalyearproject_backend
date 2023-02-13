const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignmentQuestion: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  mark: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "assigned",
    enum: ["assigned", "done", "missing"],
  },
});

// AssignmentSchema.pre("save", function (next) {
//   if (Date.now() > this.dueDate) {
//     this.status = "missing";
//   }
//   next();
// });

// AssignmentAnswerSchema.pre("save", function (next) {
//   const now = Date.now();
//   const dueDate = this.assignmentID.dueDate;
//   const difference = now - dueDate;
//   if (difference > 0 && difference <= 1800000) {
//     // 30 minutes in milliseconds
//     this.status = "turned in late";
//   } else if (difference > 1800000) {
//     this.status = "missing";
//   } else {
//     this.status = "done";
//   }
//   next();
// });

module.exports = mongoose.model("Assignment", AssignmentSchema);
