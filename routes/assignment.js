const router = require("express").Router();
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const Student = require("../models/Student");

// Route to post assignment
router.post("/", async (req, res) => {
  try {
    const { IOconn } = req;
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
    IOconn.emit("LECTURER_UPLOADED_NEW_ASSIGNMENT", "OK");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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
  const { IOconn } = req;
  AssignmentAnswer.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.send(err);
    }
    IOconn.emit("ASSIGNMENT_ANSWER_DELETED", "OK");
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

//GET ASSIGNMENT ALONE
router.get("/:id/alone", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    res.send({
      assignment,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to get assignment using assignment id and student's answer
router.get("/:assignmentId/:studentId", async (req, res) => {
  const { assignmentId, studentId } = req.params;

  try {
    const assignment = await Assignment.findById(assignmentId)
      .populate("courseId")
      .populate("creatorId", "name");
    const answer = await AssignmentAnswer.findOne({ assignmentId, studentId });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const result = {
      title: assignment.title,
      description: assignment.description,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      courseTitle: assignment.courseId.title,
      courseabrev: assignment.courseId.courseabrev,
      creatorName: assignment.creatorId.name,
      createdAt: assignment.createdAt,
      answer: answer,
      gradeReceived: answer ? answer.grade : null,
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Grade Assignment
router.post("/:assignmentId/:studentId", async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const { grade } = req.body;
  const { IOconn } = req;

  try {
    const assignmentAnswer = await AssignmentAnswer.findOneAndUpdate(
      { assignment: assignmentId, student: studentId },
      { $set: { grade } },
      { new: true }
    );

    if (!assignmentAnswer) {
      return res.status(404).send("Assignment answer not found");
    }
    IOconn.emit("ASSIGNMENT_ANSWER_GRADED", "OK");
    res.send(assignmentAnswer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//get assignment answer for a particular student's
router.get("/:assignmentId/answers/:studentId", async (req, res) => {
  const { assignmentId, studentId } = req.params;

  try {
    const answers = await AssignmentAnswer.find({
      assignmentId,
      studentId,
    }).populate("assignmentId");
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
