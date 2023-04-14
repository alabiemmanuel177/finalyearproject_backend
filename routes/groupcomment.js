const router = require("express").Router();
const GroupComment = require("../models/GroupComment");

//CREATE CLASSCOMMENT
router.post("/", async (req, res) => {
  const { IOconn } = req;
  const newGroupComment = new GroupComment(req.body);
  try {
    const savedClassComment = await newGroupComment.save();
    IOconn.emit("NEW_GROUP_COMMENT", "OK");
    return res.status(200).json(savedClassComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASSCOMMENT
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedGroupComment = await GroupComment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("GROUP_COMMENT_UPDATED", "OK");
    return res.status(200).json(updatedGroupComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASSCOMMENT
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const groupComment = await GroupComment.findById(req.params.id);
    await groupComment.delete();
    IOconn.emit("GROUP_COMMENT_DELETED", "OK");
    return res.status(200).json("Group Comment has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASSCOMMENT
router.get("/:id", async (req, res) => {
  try {
    const groupComment = await GroupComment.findById(req.params.id);
    return res.status(200).json(groupComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CLASSCOMMENT
router.get("/", async (req, res) => {
  try {
    let groupComments;
    groupComments = await GroupComment.find();
    return res.status(200).json(groupComments);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASSCOMMENT
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedGroupComment = await GroupComment.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    IOconn.emit("GROUP_COMMENT_EDITED", "OK");
    return res.status(200).json(updatedGroupComment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
