const router = require("express").Router();
const School = require("../models/School");

//CREATE SCHOOL
router.post("/", async (req, res) => {
  const { IOconn } = req;
  const newSchool = new School(req.body);
  try {
    const savedSchool = await newSchool.save();
    IOconn.emit("NEW_SCHOOL_CREATED", "OK");
    return res.status(200).json(savedSchool);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE SCHOOL
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedSchool = await School.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("SCHOOL_UPDATED", "OK");
    return res.status(200).json(updatedSchool);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE SCHOOL
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const school = await School.findById(req.params.id);
    await school.delete();
    IOconn.emit("SCHOOL_DELETED", "OK");
    return res.status(200).json("School has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET SCHOOL
router.get("/:id", async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    return res.status(200).json(school);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL DEPARTMENT
router.get("/", async (req, res) => {
  try {
    let schools;
    schools = await School.find();
    return res.status(200).json(schools);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH DEPARTMENT
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedSchool = await School.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    IOconn.emit("SCHOOL_UPDATED", "OK");
    return res.status(200).json(updatedSchool);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
