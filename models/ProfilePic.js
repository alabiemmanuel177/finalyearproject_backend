const mongoose = require("mongoose");
const ProfilePicSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    profilePic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfilePic",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ProfilePic", ProfilePicSchema);
