const router = require("express").Router();
const ClassComment = require("../models/ClassComment");

//CREATE CLASSCOMMENT
router.post("/", async (req, res) => {
  const newClassComment = new ClassComment(req.body);
  try {
    const savedClassComment = await newClassComment.save();
    return res.status(200).json(savedClassComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASSCOMMENT
router.put("/:id", async (req, res) => {
  try {
    const updatedClassComment = await ClassComment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedClassComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASSCOMMENT
router.delete("/:id", async (req, res) => {
  try {
    const classComment = await ClassComment.findById(req.params.id);
    await classComment.delete();
    return res.status(200).json("Class Comment has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASSCOMMENT
router.get("/:id", async (req, res) => {
  try {
    const classComment = await ClassComment.findById(req.params.id);
    return res.status(200).json(classComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CLASSCOMMENT
router.get("/", async (req, res) => {
  try {
    let classComments;
    classComments = await ClassComment.find();
    return res.status(200).json(classComments);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASSCOMMENT
router.patch("/:id", async (req, res) => {
  try {
    const updatedClassComment = await ClassComment.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    return res.status(200).json(updatedClassComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
