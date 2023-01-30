const router = require("express").Router();
const Assignment = require("../models/Assignment");

//CREATE ASSIGNMENT
router.post("/", async (req, res) => {
  const newAssignment = new Assignment(req.body);
  try {
    const savedAssignment = await newAssignment.save();
    return res.status(200).json(savedAssignment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE ASSIGNMENT
router.put("/:id", async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedAssignment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE ASSIGNMENT
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    await assignment.delete();
    return res.status(200).json("Assignment has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ASSIGNMENT
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    return res.status(200).json(assignment);
  } catch (err) {
    return res.status(500).json(err);
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

//PATCH ASSIGNMENT
router.patch("/:id", async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    return res.status(200).json(updatedAssignment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
