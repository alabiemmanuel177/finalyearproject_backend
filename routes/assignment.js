const router = require("express").Router();
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");

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
    IOconn.emit("NEW_ASSIGNMENT_UPLOADED", "OK");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update assignment answer
router.put("/assignment-answers/:id", function (req, res) {
  const { IOconn } = req;

  AssignmentAnswer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    function (err, updatedAssignmentAnswer) {
      if (err) {
        res.send(err);
      }
      IOconn.emit("ASSIGNMENT_UPDATED", "OK");

      res.json(updatedAssignmentAnswer);
    }
  );
});

//DELETE ASSIGNMENT
router.delete("/assignments/:id", function (req, res) {
  const { IOconn } = req;

  Assignment.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.send(err);
    }
    IOconn.emit("ASSIGNMENT_DELETED", "OK");

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
router.post("/:assignmentAnswerId", async (req, res) => {
  try {
    const { assignmentAnswerId } = req.params;
    const { grade } = req.body;

    // Input validation
    if (!assignmentAnswerId || !grade) {
      return res.status(400).send("Bad Request");
    }

    // Update assignment answer in the database
    const assignmentAnswer = await AssignmentAnswer.findOneAndUpdate(
      { _id: assignmentAnswerId },
      { $set: { grade } },
      { new: true }
    );

    // Assignment answer not found
    if (!assignmentAnswer) {
      return res.status(404).send("Assignment answer not found");
    }

    // Emit real-time event to clients
    req.IOconn.emit("ASSIGNMENT_ANSWER_GRADED", "OK");

    // Send updated assignment answer as response
    res.send(assignmentAnswer);

    // Log assignmentAnswerId and grade
    console.log(`Assignment Answer ID: ${assignmentAnswerId}, Grade: ${grade}`);
  } catch (error) {
    // Handle errors
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

//UPDATE ASSIGNMENT
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("ASSIGNMENT_UPDATED", "OK");
    return res.status(200).json(updatedAssignment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
