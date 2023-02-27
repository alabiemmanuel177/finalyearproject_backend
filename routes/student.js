const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const Class = require("../models/Class");
const Course = require("../models/Course");

//UPDATE STUDENT
router.put("/:id", async (req, res) => {
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
  if (req.body.studentId === req.params.id) {
    try {
      const student = await Student.findById(req.params.id);
      try {
        await Lecturer.findByIdAndDelete(req.params.id);
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
    const student = await Student.findById(req.params.id);
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
    const studentClass = await Class.findById(student.class).populate(
      "courses"
    );
    // Get an array of course IDs from the class schema
    const courseIds = studentClass.courses.map((course) => course._id);
    const assignmentAnswers = await AssignmentAnswer.find({
      student: studentId,
    });
    const submittedAssignmentIds = assignmentAnswers.map(
      (answer) => answer.assignmentId
    );
    const submittedAssignments = await Assignment.find({
      courseId: { $in: courseIds },
      _id: { $in: submittedAssignmentIds },
    }).populate("courseId");
    res.json(submittedAssignments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get all assignments not submitted by a student for courses in their class but can still be submitted
router.get("/assignments/missing/:studentId", async (req, res) => {
  const fifteenMinutes = 15 * 60 * 1000; // in milliseconds

  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    const studentClass = await Class.findById(student.class).populate(
      "courses"
    );
    const courseIds = studentClass.courses.map((course) => course._id);

    const currentDate = new Date();

    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
      dueDate: { $gt: currentDate },
    });

    const assignmentAnswers = await AssignmentAnswer.find({
      studentId: req.params.studentId,
    });    

    // Filter the assignments to exclude those that the student has already answered
    const uncompletedAssignments = assignments.filter((assignment) => {
      return !assignmentAnswers.some(
        (answer) => answer.assignmentId.toString() === assignment._id.toString()
      );
    });
    console.log(assignments);

    const currentTime = currentDate.getTime();

    const notSubmittedAndLateAssignments = uncompletedAssignments.filter(
      (assignment) => {
        const assignmentDueTime = assignment.dueDate.getTime();
        const timeDifference = currentTime - assignmentDueTime;
        return timeDifference > 0 && timeDifference <= fifteenMinutes;
      }
    );

    res.json(notSubmittedAndLateAssignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all assignments students can no longer submit
// Route to get all assignments that a student hasn't submitted for the courses he is offering which are in the class schema and can no longer submit
router.get("/assignments/missed/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId; // assuming user authentication middleware sets the user ID in req.user.id
    const student = await Student.findById(studentId);
    const studentClass = await Class.findById(student.class).populate(
      "courses"
    );
    // Get an array of course IDs from the class schema
    const courseIds = studentClass.courses.map((course) => course._id);
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
    });
    // Find all assignment answers for the student
    const assignmentAnswers = await AssignmentAnswer.find({
      studentId: req.params.studentId,
    });

    // Filter the assignments to exclude those that the student has already answered
    const uncompletedAssignments = assignments.filter((assignment) => {
      return !assignmentAnswers.some(
        (answer) => answer.assignmentId.toString() === assignment._id.toString()
      );
    });

    res.status(200).json(uncompletedAssignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
