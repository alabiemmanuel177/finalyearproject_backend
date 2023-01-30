const router = require("express").Router();
const ClassPost = require("../models/ClassPost");

//CREATE CLASSPOST
router.post("/", async (req, res) => {
  const newClassPost = new ClassPost(req.body);
  try {
    const savedClassPost = await newClassPost.save();
    return res.status(200).json(savedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASSPOST
router.put("/:id", async (req, res) => {
  try {
    const updatedClassPost = await ClassPost.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASSPOST
router.delete("/:id", async (req, res) => {
  try {
    const classPost = await ClassPost.findById(req.params.id);
    await classPost.delete();
    return res.status(200).json("Class Post has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const classPost = await ClassPost.findById(req.params.id);
    return res.status(200).json(classPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CLASSPOST
router.get("/", async (req, res) => {
  try {
    let classPosts;
    classPosts = await ClassPost.find();
    return res.status(200).json(classPosts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASSPOST
router.patch("/:id", async (req, res) => {
  try {
    const updatedClassPost = await ClassPost.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    return res.status(200).json(updatedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
