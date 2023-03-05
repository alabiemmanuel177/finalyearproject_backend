const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Lecturer = require("../models/Lecturer");
const Course = require("../models/Course");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

//UPDATE LECTURER
router.put("/:id", async (req, res) => {
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
  if (req.body.lecturerId === req.params.id) {
    try {
      const lecturer = await Lecturer.findById(req.params.id);
      try {
        await lecturer.findByIdAndDelete(req.params.id);
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

//CHANGE PASSWORD LECTURER
router.post("/reset", async (req, res) => {
  const { email } = req.body;

  // Find the lecturer with the given email
  const lecturer = await Lecturer.findOne({ email });
  if (!lecturer) return res.status(400).send({ error: "Invalid email" });

  // Generate and send an OTP
  const otp = generateOTP();
  sendOTP(lecturer.email, otp);

  // Save the OTP in the lecturer's database record
  lecturer.otp = otp;
  await lecturer.save();

  res.send({ message: "OTP sent" });
});

router.post("/reset/verify", async (req, res) => {
  const { email, otp, password } = req.body;

  // Find the lecturer with the given email
  const lecturer = await Lecturer.findOne({ email });
  if (!lecturer) return res.status(400).send({ error: "Invalid email" });

  // Check if the OTP is correct
  if (lecturer.otp !== otp)
    return res.status(400).send({ error: "Invalid OTP" });

  // Update the lecturer's password
  lecturer.password = password;
  await lecturer.save();

  res.send({ message: "Password updated" });
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

module.exports = router;
