const express = require("express");
const router = express.Router();
const Group = require("../models/Group");

// Route to create a new group
router.post("/create", async (req, res) => {
  try {
    const { courseId, groupName, students } = req.body;
    const newGroup = new Group({ courseId, groupName, students });
    await newGroup.save();
    res.send({ success: true, message: "Group created successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route to edit an existing group
router.put("/:groupId/edit", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { courseId, groupName, students } = req.body;
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { courseId, groupName, students },
      { new: true }
    );
    res.send({
      success: true,
      message: "Group updated successfully",
      updatedGroup,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Route for getting group for a particular course
app.get("/course/:courseId/group", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const group = await Group.findOne({ course: courseId });
    if (!group) return res.status(404).send({ error: "Group not found" });
    res.send(group);
  } catch (error) {
    res.status(500).send({ error: "Error getting group" });
  }
});

module.exports = router;