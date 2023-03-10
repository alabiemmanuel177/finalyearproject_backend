const router = require("express").Router();
const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");
const Student = require("../models/Student");
const Class = require("../models/Class");
const CourseMaterial = require('../models/CourseMaterial');
const Group = require("../models/Group");

//CREATE COURSE
router.post("/", async (req, res) => {
  const newCourse = new Course(req.body);
  try {
    const savedCourse = await newCourse.save();
    return res.status(200).json(savedCourse);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE COURSE
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedCourse);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE COURSE
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    await course.delete();
    return res.status(200).json("Course has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET COURSE
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    return res.status(200).json(course);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL COURSE
router.get("/", async (req, res) => {
  try {
    let courses;
    courses = await Course.find();
    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH COURSE
router.patch("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    return res.status(200).json(updatedCourse);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get the lecturers and students for a particular course
router.get("/:id/members", async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find the course
    const course = await Course.findById(courseId).populate('lecturer');

    // If the course is not found, return an error
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find all the classes for the course
    const classes = await Class.find({ course: courseId });

    // Find all the students for the classes
    const students = await Student.find({ class: { $in: classes.map(c => c._id) } });

    // Return the lecturer and students
    return res.json({
      lecturer: course.lecturer,
      students: students,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get CourseMaterial for a particular course
router.get('/:id/materials', async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find the course
    const course = await Course.findById(courseId);

    // If the course is not found, return an error
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the course materials for the course
    const courseMaterials = await CourseMaterial.find({ course: courseId });

    // Return the course materials
    return res.json({
      course: course,
      materials: courseMaterials,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get("/:courseId/groups", async (req, res) => {
  try {
    const { courseId } = req.params;
    const groups = await Group.find({ course: courseId });
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Route to get the class ID from a course ID
router.get("/:courseId/class", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const classId = await Class.findOne({ courses: course._id });
    if (!classId) {
      return res.status(404).json({ message: "Class not found" });
    }
    return res.status(200).json({ classId: classId._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;