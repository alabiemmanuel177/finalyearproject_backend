const router = require("express").Router();
const Course = require("../models/Course");

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

module.exports = router;
