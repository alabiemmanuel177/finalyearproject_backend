const router = require("express").Router();
const ProfilePic = require("../models/ProfilePic");

//CREATE ProfilePic
router.post("/", async (req, res) => {
  const newProfilePic = new ProfilePic(req.body);
  try {
    const savedProfilePic = await newProfilePic.save();
    return res.status(200).json(savedProfilePic);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//UPDATE ProfilePic
router.put("/:id", async (req, res) => {
  try {
    const updatedProfilePic = await ProfilePic.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedProfilePic);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE ProfilePic
router.delete("/:id", async (req, res) => {
  try {
    const profilePic = await ProfilePic.findById(req.params.id);
    await profilePic.delete();
    return res.status(200).json("ProfilePic has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CATEGORY
router.get("/:id", async (req, res) => {
  try {
    const profilePic = await ProfilePic.findById(req.params.id);
    return res.status(200).json(profilePic);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CATEGORY
router.get("/", async (req, res) => {
  try {
    let profilePics;
    profilePics = await ProfilePic.find();
    return res.status(200).json(profilePics);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH ProfilePic
router.patch("/:id", async (req, res) => {
  try {
    const updatedProfilePic = await ProfilePic.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    return res.status(200).json(updatedProfilePic);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
