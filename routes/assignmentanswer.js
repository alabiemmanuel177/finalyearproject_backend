const router = require("express").Router();
const AssignmentAnswer = require("../models/AssignmentAnswer");

//CREATE ASSIGNMENT ANSWER
router.post("/", async (req, res) => {
  const newAssignmentAnswer = new AssignmentAnswer(req.body);
  try {
    const savedAssignmentAnswer = await newAssignmentAnswer.save();
    return res.status(200).json(savedAssignmentAnswer);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE ASSIGNMENT ANSWER
router.put("/:id", async (req, res) => {
  try {
    const updatedAssignmentAnswer = await AssignmentAnswer.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedAssignmentAnswer);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE ASSIGNMENT ANSWER
router.delete("/:id", async (req, res) => {
  try {
    const assignmentAnswer = await AssignmentAnswer.findById(req.params.id);
    await assignmentAnswer.delete();
    return res.status(200).json("Assignment Answer has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ASSIGNMENT ANSWER
router.get("/:id", async (req, res) => {
  try {
    const assignmentAnswer = await AssignmentAnswer.findById(req.params.id);
    return res.status(200).json(assignmentAnswer);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL ASSIGNMENT ANSWER
router.get("/", async (req, res) => {
  try {
    let assignmentAnswers;
    assignmentAnswers = await AssignmentAnswer.find();
    return res.status(200).json(assignmentAnswers);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH ASSIGNMENT ANSWER
router.patch("/:id", async (req, res) => {
  try {
    const updatedAssignmentAnswer = await AssignmentAnswer.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    return res.status(200).json(updatedAssignmentAnswer);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
