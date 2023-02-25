const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfilePictureSchema = new Schema({
  studentId: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: true
  }
});

const ProfilePicture = mongoose.model("ProfilePicture", ProfilePictureSchema);

module.exports = ProfilePicture;
