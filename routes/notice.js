const router = require("express").Router();
const Admin = require("../models/Admin");
const Notice = require("../models/Notice");

//CREATE NOTICE
router.post("/", async (req, res) => {
  const newNotice = new Notice(req.body);
  try {
    const savedNotice = await newNotice.save();
    return res.status(200).json(savedNotice);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//UPDATE NOTICE
router.put("/:id", async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedNotice);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE NOTICE
router.delete("/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    await notice.delete();
    return res.status(200).json("Notice has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET NOTICE
router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    return res.status(200).json(notice);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL NOTICE
router.get("/", async (req, res) => {
  try {
    let notices;
    notices = await Notice.find().populate("author");
    return res.status(200).json(notices);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH NOTICE
router.patch("/:id", async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    return res.status(200).json(updatedNotice);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
