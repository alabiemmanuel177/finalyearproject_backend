const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Class = require("../models/Class");

function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

router.post("/:courseId/:classId/:capacity", async (req, res) => {
  const courseId = req.params.courseId;
  const classId = req.params.classId;
  const capacity = parseInt(req.params.capacity);
  const course = await Course.findById(courseId);
  const students = await Student.find({ class: classId }).populate("class");
  const shuffledStudents = shuffle(students);
  const groupCount = Math.ceil(students.length / capacity);
  const groups = [];

  for (let i = 0; i < groupCount; i++) {
    const start = i * capacity;
    const end = start + capacity;
    const groupMembers = shuffledStudents.slice(start, end);
    const groupLeader =
      groupMembers[Math.floor(Math.random() * groupMembers.length)];

    const group = new Group({
      name: `Group ${i + 1}`,
      course: courseId,
      class: classId,
      capacity: capacity,
      leader: groupLeader._id,
      students: groupMembers.map((student) => student._id),
    });

    await group.save();

    groups.push(group);
  }

  res.json({ groups });
});

// Get groups for a particular course
router.get("/courses/:courseId/groups", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const groups = await Group.find({ course: courseId }).populate("students");
    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Get student's group for a particular course
router.get(
  "/students/:studentId/courses/:courseId/groups",
  async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const courseId = req.params.courseId;
      const student = await Student.findById(studentId).populate("class");
      const groups = await Group.find({
        course: courseId,
        class: student.class._id,
      }).populate("students");
      const studentGroup = groups.find((group) =>
        group.students.some((s) => s._id.toString() === studentId)
      );
      if (!studentGroup) {
        return res
          .status(404)
          .json({ msg: "Student not found in any group for this course" });
      }
      res.status(200).json(studentGroup);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
