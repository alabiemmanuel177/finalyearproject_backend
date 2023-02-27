const router = require("express").Router();
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const Student = require("../models/Student");
// Route to post assignment
router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, courseId, creatorId, grade } =
      req.body;

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
      creatorId,
      grade,
    });

    await assignment.save();

    res.status(201).json({ message: "Assignment created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to post assignment answer
router.post("/assignment-answer/:assignmentId", async (req, res) => {
  try {
    // Get the assignment ID from the URL parameter
    const assignmentId = req.params.assignmentId;

    // Find the assignment to check its due date
    const assignment = await Assignment.findById(assignmentId);

    // Check if the assignment is still accepting submissions
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const submissionPeriodEnd = new Date(dueDate.getTime() + 15 * 60 * 1000); // 15 mins after due date
    if (now > submissionPeriodEnd) {
      return res.status(400).json({ message: "Submission period has ended" });
    }
    const isLateSubmission = now > dueDate;

    // Create the assignment answer document
    const assignmentAnswer = new AssignmentAnswer({
      studentId: req.body.studentId, // assuming you have some authentication middleware that sets req.user.id
      assignmentId: assignmentId,
      answerText: req.body.answerText,
      createdAt: new Date(),
    });

    // Save the assignment answer document
    const savedAssignmentAnswer = await assignmentAnswer.save();

    // Return a response indicating whether the submission was turned in late
    return res.status(200).json({
      message: isLateSubmission ? "Turned in late" : "Submission successful",
      assignmentAnswer: savedAssignmentAnswer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//update assignment answer
router.put("/assignment-answers/:id", function (req, res) {
  AssignmentAnswer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    function (err, updatedAssignmentAnswer) {
      if (err) {
        res.send(err);
      }
      res.json(updatedAssignmentAnswer);
    }
  );
});

//DELETE ASSIGNMENT
router.delete("/assignments/:id", function (req, res) {
  Assignment.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.send(err);
    }
    res.json({ message: "Assignment successfully deleted" });
  });
});

//Delete Assignment Answer
router.delete("/assignment-answers/:id", function (req, res) {
  AssignmentAnswer.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.send(err);
    }
    res.json({ message: "AssignmentAnswer successfully deleted" });
  });
});

//GET ASSIGNMENT
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    const answers = await AssignmentAnswer.find({
      assignmentID: assignment._id,
    });
    const status = {};
    answers.forEach((answer) => {
      status[answer.studentID] = answer.status;
    });
    res.send({
      assignment,
      status,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to get assignment using assignment id and student's answer
router.get("/:assignmentId/:studentId", async (req, res) => {
  try {
    // Find the assignment using the assignment id
    const assignment = await Assignment.findById(req.params.assignmentId);

    // Find the student using the student id
    const student = await Student.findById(req.params.studentId);

    // Check if the student has submitted an answer to the assignment
    const answer = await AssignmentAnswer.find({
      assignmentId: assignment.assignmentId,
    });

    if (!answer) {
      // If the student has not submitted an answer, return an error message
      return res.status(404).json({ message: "Answer not found" });
    }

    // If the student has submitted an answer, return the assignment and the student's answer
    res.json({ assignment, answer});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//GET ALL ASSIGNMENT
router.get("/", async (req, res) => {
  try {
    let assignments;
    assignments = await Assignment.find();
    return res.status(200).json(assignments);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//Grade Assignment
router.post("/:assignmentId/:studentId", async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const { grade } = req.body;

  try {
    const assignmentAnswer = await AssignmentAnswer.findOneAndUpdate(
      { assignment: assignmentId, student: studentId },
      { $set: { grade } },
      { new: true }
    );

    if (!assignmentAnswer) {
      return res.status(404).send("Assignment answer not found");
    }

    res.send(assignmentAnswer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
