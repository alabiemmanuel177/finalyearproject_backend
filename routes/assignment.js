const router = require("express").Router();
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");

// Route to post assignment
router.post("/", (req, res) => {
  const newAssignment = new Assignment({
    assignmentQuestion: req.body.assignmentQuestion,
    dueDate: req.body.dueDate,
    courseID: req.body.courseID,
    mark: req.body.mark,
    title: req.body.title,
    status: req.body.status,
  });

  newAssignment.save((error, assignment) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json(assignment);
    }
  });
});

// Route to post assignment answer
router.post("/assignmentAnswer", (req, res) => {
  const newAssignmentAnswer = new AssignmentAnswer({
    assignmentID: req.body.assignmentID,
    studentID: req.body.studentID,
    answer: req.body.answer,
    status: req.body.status,
  });

  newAssignmentAnswer.save((error, assignmentAnswer) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).json(assignmentAnswer);
    }
  });
});

//UPDATE ASSIGNMENT
router.put("/assignments/:id", function (req, res) {
  Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    function (err, updatedAssignment) {
      if (err) {
        res.send(err);
      }
      res.json(updatedAssignment);
    }
  );
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

//route to get missing assignment
router.get("/courses/:courseId/assignments/missing", (req, res) => {
  const courseId = req.params.courseId;
  Assignment.find({ courseId: courseId, status: "missing" })
    .then((assignments) => {
      res.status(200).json({ assignments });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

//route to get assigned assignment
router.get("/courses/:courseId/assignments/assigned", (req, res) => {
  const courseId = req.params.courseId;
  Assignment.find({ courseId: courseId, status: "assigned" })
    .then((assignments) => {
      res.status(200).json({ assignments });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

//route to get done assignment
router.get("/courses/:courseId/assignments/done", (req, res) => {
  const courseId = req.params.courseId;
  Assignment.find({ courseId: courseId, status: "done" })
    .then((assignments) => {
      res.status(200).json({ assignments });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
