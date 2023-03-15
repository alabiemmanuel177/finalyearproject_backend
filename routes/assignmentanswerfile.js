const router = require("express").Router();
const AssignmentAnswerFile = require("../models/AssignmentAnswerFile");

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const assignmentAnswerFile = await AssignmentAnswerFile.findById(req.params.id);
    return res.status(200).json(assignmentAnswerFile);
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
