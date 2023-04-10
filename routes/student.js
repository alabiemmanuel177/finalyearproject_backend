const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const Class = require("../models/Class");
const { uploader, deleteFile } = require("../util/cloudinary");
const multer = require("multer");
const fs = require("fs");
const ProfilePic = require("../models/ProfilePic");

//UPDATE STUDENT
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  if (req.body.studentId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      IOconn.emit("STUDENT_UPDATED", "OK");
      return res.status(200).json(updatedStudent);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE STUDENT
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;

  if (req.body.studentId === req.params.id) {
    try {
      const student = await Student.findById(req.params.id);
      try {
        await Lecturer.findByIdAndDelete(req.params.id);
        IOconn.emit("STUDENT_DELETED", "OK");
        return res.status(200).json("Student has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Student Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET STUDENT
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "profilePic"
    );
    const { password, ...others } = student._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//CHANGE PASSWORD STUDENT
router.post("/change-password", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;

  try {
    const student = await Student.findOne({ _id: id });

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Incorrect old password" });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);

    await student.save();
    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//get student assigned assignments
router.get("/:studentId/assignments/notsubmitted", async (req, res) => {
  try {
    // Get the student ID from the request parameters
    const { studentId } = req.params;

    // Find the student
    const student = await Student.findById(studentId);

    // Find the class the student is in
    const studentClass = await Class.findById(student.class).populate(
      "courses"
    );

    // Get an array of course IDs from the class schema
    const courseIds = studentClass.courses.map((course) => course._id);

    // Find all assignments that the student has not submitted
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
      _id: {
        $nin: await AssignmentAnswer.find({ studentId }).distinct(
          "assignmentId"
        ),
      },
      dueDate: { $gt: new Date() },
    }).populate("courseId");

    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get all assignments submitted by a student for courses in their class
router.get("/assignments/submitted/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId; // assuming the student ID is stored in the `id` field of the `req.user` object
    // Find the student
    const student = await Student.findById(studentId);
    const classId = student.class._id;
    const assignments = await AssignmentAnswer.find({ studentId: student._id })
      .populate({
        path: "assignmentId",
        match: { courseId: { $in: student.class.courses } },
        populate: {
          path: "courseId",
          model: "Course",
        },
      })
      .populate("assignmentId")
      .exec();

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Helper function to get course IDs for a given student
const getCourseIds = async (studentId) => {
  const courses = await Student.findById(studentId)
    .populate("class")
    .populate({ path: "class", populate: { path: "courses" } })
    .select("class")
    .lean();
  const courseIds = courses.class.courses.map((course) => course._id);
  return courseIds;
};

// Route to get all assignments that a student hasn't submitted for the courses he is offering which are in the class schema and can no longer submit
router.get("/assignments/missed/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate({
        path: "class",
        populate: {
          path: "courses",
          model: "Course",
        },
      })
      .exec();

    const classId = student.class._id;
    const courses = student.class.courses;

    const assignments = await Assignment.find({
      courseId: { $in: courses },
      dueDate: { $lt: new Date() },
      _id: {
        $nin: await AssignmentAnswer.distinct("assignmentId", {
          studentId: student._id,
        }),
      },
    })
      .populate("courseId")
      .exec();

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
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
      const user = await Student.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "Student not found" });
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
    const user = await Student.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
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
