const router = require("express").Router();
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");

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
    const admin = await Admin.findById(req.params.id);
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
    const courses = await Course.find();
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

module.exports = router;
