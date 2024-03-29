const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Lecturer = require("../models/Lecturer");
const Course = require("../models/Course");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const { uploader, deleteFile } = require("../util/cloudinary");
const multer = require("multer");
const fs = require("fs");
const ProfilePic = require("../models/ProfilePic");

//UPDATE LECTURER
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  if (req.body.lecturerId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedLecturer = await Lecturer.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      IOconn.emit("LECTURER_UPDATED", "OK");
      return res.status(200).json(updatedLecturer);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE LECTURER
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  if (req.body.lecturerId === req.params.id) {
    try {
      const lecturer = await Lecturer.findById(req.params.id);
      try {
        await lecturer.findByIdAndDelete(req.params.id);
        IOconn.emit("LECTURER_DELETED", "OK");
        return res.status(200).json("Lecturer has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Lecturer Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET LECTURER
router.get("/:id", async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    const { password, ...others } = lecturer._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL NOTICE
router.get("/", async (req, res) => {
  try {
    let lecturers;
    lecturers = await Lecturer.find();
    return res.status(200).json(lecturers);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//route to get course count
router.get("/:id/count-courses", async (req, res) => {
  try {
    const { id } = req.params;
    const coursesCount = await Course.countDocuments({ lecturer: id });
    res.status(200).json({ count: coursesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//route to get total number of students a lecturer is teaching
router.get("/:id/students-count", async (req, res) => {
  try {
    const lecturerId = req.params.id;

    // Find all the classes that the lecturer is teaching
    const classes = await Class.find({ lecturer: lecturerId });

    // Sum up the number of students in those classes
    const studentCount = await Student.countDocuments({
      class: { $in: classes },
    });

    res.json({ studentCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to get the number of assignments given by a lecturer
router.get("/:lecturerId/assignments/count", async (req, res) => {
  try {
    const count = await Assignment.countDocuments({
      creatorId: req.params.lecturerId,
    });
    res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get courses a lecturer is teaching
router.get("/:lecturerId/courses", async (req, res) => {
  try {
    const lecturerCourses = await Course.find({
      lecturer: req.params.lecturerId,
    }).populate("lecturer");
    res.status(200).json(lecturerCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// route to get assignment a lecturer gave
router.get("/assignments/:lecturerId", async (req, res) => {
  const lecturerId = req.params.lecturerId;
  try {
    const assignments = await Assignment.find({
      creatorId: lecturerId,
    }).populate("courseId");
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//CHANGE PASSWORD Lecturer
router.post("/change-password", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  try {
    const lecturer = await Lecturer.findOne({ _id: id });

    const isMatch = await bcrypt.compare(oldPassword, lecturer.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    lecturer.password = await bcrypt.hash(newPassword, salt);

    await lecturer.save();
    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//route to get assignments for all the courses a lecturer is offering
router.get("/assignments/:lecturerId", async (req, res) => {
  try {
    const lecturerId = req.params.lecturerId;

    // Find all courses taught by the given lecturer
    const courses = await Course.find({ lecturer: lecturerId });

    // Extract the course IDs from the courses
    const courseIds = courses.map((course) => course._id);

    // Find all assignments for the given courses
    const assignments = await Assignment.find({ course: { $in: courseIds } });

    // Return the assignments
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
      const user = await Lecturer.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "Lecturer not found" });
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
    const user = await Lecturer.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "Lecturer not found" });
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
