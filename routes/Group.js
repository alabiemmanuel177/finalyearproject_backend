const router = require("express").Router();
const Group = require("../models/Group");

//CREATE GROUP
router.post("/", async (req, res) => {
  const newGroup = new Group(req.body);
  try {
    const savedGroup = await newGroup.save();
    return res.status(200).json(savedGroup);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE GROUP
router.put("/:id", async (req, res) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedGroup);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE GROUP
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    await group.delete();
    return res.status(200).json("Group Answer has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET GROUP
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    return res.status(200).json(group);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL GROUP
router.get("/", async (req, res) => {
  try {
    let groups;
    groups = await Group.find();
    return res.status(200).json(groups);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH GROUP
router.patch("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    return res.status(200).json(group);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
