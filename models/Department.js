const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);