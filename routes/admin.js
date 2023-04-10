const router = require("express").Router();
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");
const { uploader, destroy, deleteFile } = require("../util/cloudinary");
const multer = require("multer");
const fs = require("fs");
const ProfilePic = require("../models/ProfilePic");

//UPDATE ADMIN
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  if (req.body.adminId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      IOconn.emit("ADMIN_UPDATED", "OK");
      return res.status(200).json(updatedAdmin);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE ADMIN
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  if (req.body.adminId === req.params.id) {
    try {
      const admin = await Admin.findById(req.params.id);
      try {
        await admin.findByIdAndDelete(req.params.id);
        return res.status(200).json("Admin has been deleted");
      } catch (err) {
        IOconn.emit("ADMIN_DELETED", "OK");
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Admin Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET ADMIN
router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("profilePic");
    const { password, ...others } = admin._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//CHANGE PASSWORD ADMIN
router.post("/change-password", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ _id: id });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    await admin.save();
    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//GET ALL STUDENT
router.get("/all/students", async (req, res) => {
  try {
    const students = await Student.find({})
      .populate({
        path: "department",
        populate: { path: "school", model: "School" },
      })
      .exec();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//GET ALL LECTURERS
router.get("/all/lecturers", async (req, res) => {
  try {
    const lecturers = await Lecturer.find({})
      .populate({
        path: "department",
        populate: { path: "school", model: "School" },
      })
      .exec();
    res.status(200).json(lecturers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//GET ALL COURSES
router.get("/all/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate("lecturer");
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//Students Count
router.get("/students/count", async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/lecturers/count", async (req, res) => {
  try {
    const count = await Lecturer.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/courses/count", async (req, res) => {
  try {
    const count = await Course.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * This should be properly extracted into a utility function
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    //reject file
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

// Upload a new profile picture for a user
router.post(
  "/:userId/profilepic",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const user = await Admin.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const result = await uploader(req, "BUCODEL/profile_pictures");

      // Create a new profile picture document in the database
      const newProfilePic = new ProfilePic({
        fileUrl: result.secure_url,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        public_id: result.id,
      });
      await newProfilePic.save();

      // Update the reference to the new profile picture in the user's document
      user.profilePic = newProfilePic._id;
      await user.save();

      res
        .status(200)
        .json({ message: "Profile picture uploaded successfully" });
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete the profile picture for a user
router.delete("/:userId/profilepic", async (req, res) => {
  try {
    const user = await Admin.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if the user has a profile picture
    if (!user.profilePic) {
      return res
        .status(400)
        .json({ message: "User does not have a profile picture" });
    }

    const profilePic = await ProfilePic.findById(user.profilePic);

    if (!profilePic) {
      return res.status(404).json({ message: "Profile picture not found" });
    }

    // Delete the profile picture from Cloudinary
    await deleteFile(profilePic.public_id);

    // Delete the profile picture document from the database
    await ProfilePic.findByIdAndDelete(profilePic._id);

    // Remove the reference to the profile picture from the user's document
    user.profilePic = undefined;
    await user.save();

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
