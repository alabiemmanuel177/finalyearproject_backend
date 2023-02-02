const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    level: {
      type: Number,
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
