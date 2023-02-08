const router = require("express").Router();
const Class = require("../models/Class");
const Course = require("../models/Course");

//CREATE CLASS
router.post("/", async (req, res) => {
  const newClass = new Class(req.body);
  try {
    const savedClass = await newClass.save();
    return res.status(200).json(savedClass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASS
router.put("/:id", async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedClass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASS
router.delete("/:id", async (req, res) => {
  try {
    const Cclass = await Class.findById(req.params.id);
    await Cclass.delete();
    return res.status(200).json("Class has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASS
router.get("/:id", async (req, res) => {
  try {
    const Cclass = await Class.findById(req.params.id);
    return res.status(200).json(Cclass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CLASS
router.get("/", async (req, res) => {
  try {
    let classs;
    classs = await Class.find();
    return res.status(200).json(classs);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASS
router.patch("/:id", async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    return res.status(200).json(updatedClass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASS COURSES
router.get("/courses/:id", async (req, res) => {
  try {
    const objClass = await Class.findById(req.params.id);
    if (!objClass) {
      return res.status(404).send("Class not found");
    }

    const courses = await Course.find({
      _id: {
        $in: objClass.courses,
      },
    });

    res.send({ objClass, courses });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
