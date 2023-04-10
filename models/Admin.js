// Adds Admin schema to Ember. js. This is used to ensure that we don't accidentally have a model that's in an unresolvable state
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfilePic",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Admin", AdminSchema);
