const router = require("express").Router();
const Class = require("../models/Class");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const CourseMaterial = require("../models/CourseMaterial");

//CREATE CLASS
router.post("/", async (req, res) => {
  const { IOconn } = req;
  const newClass = new Class(req.body);
  try {
    const savedClass = await newClass.save();
    IOconn.emit("CLASS_CREATED", "OK");
    return res.status(200).json(savedClass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASS
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("CLASS_UPDATED", "OK");
    return res.status(200).json(updatedClass);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASS
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const Cclass = await Class.findById(req.params.id);
    await Cclass.delete();
    IOconn.emit("CLASS_DELETED", "OK");
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
  const { IOconn } = req;

  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    IOconn.emit("CLASS_UPDATED", "OK");
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

//GET CLASS RESOURCES
router.get("/classes/:classId/resources", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    const courses = await Course.find({
      course: { $in: classObject.courses },
    });
    const resources = await CourseMaterial.find({
      course: { $in: courses },
    }).populate("course");
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to count the number of courses in a class object
router.get("/classes/:classId/course-count", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    // Return the number of courses in the class object
    res.send({ courseCount: classObject.courses.length });
  } catch (err) {
    res.status(500).send("Error retrieving course count for this class");
  }
});

// Route to count the number of assignments in a class
router.get("/classes/:classId/assignment-count", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    // Find all assignments with a course_id included in the class object's courses attribute
    const assignments = await Assignment.find({
      course_id: { $in: classObject.courses },
    });
    if (!assignments)
      return res.status(404).send("No assignments found for this class");

    // Return the number of assignments in the class
    res.send({ assignmentCount: assignments.length });
  } catch (err) {
    res.status(500).send("Error retrieving assignment count for this class");
  }
});

// Route to get all assigned assignments in a class
router.get("/classes/:classId/assigned-assignments", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    // Find all assignments with a course_id included in the class object's courses attribute and a status of "assigned"
    const assignments = await Assignment.find({
      course_id: { $in: classObject.courses },
      status: "assigned",
    });
    if (!assignments)
      return res
        .status(404)
        .send("No assigned assignments found for this class");

    // Return the assigned assignments in the class
    res.send(assignments);
  } catch (err) {
    res
      .status(500)
      .send("Error retrieving assigned assignments for this class");
  }
});

// Route to get all missing assignments in a class
router.get("/classes/:classId/missing-assignments", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    // Find all assignments with a course_id included in the class object's courses attribute and a status of "missing"
    const assignments = await Assignment.find({
      course_id: { $in: classObject.courses },
      status: "missing",
    });
    if (!assignments)
      return res
        .status(404)
        .send("No missing assignments found for this class");

    // Return the missing assignments in the class
    res.send(assignments);
  } catch (err) {
    res.status(500).send("Error retrieving missed assignments for this class");
  }
});

// Route to get all done assignments in a class
router.get("/classes/:classId/done-assignments", async (req, res) => {
  try {
    // Find the class object with the specified class ID
    const classObject = await Class.findById(req.params.classId);
    if (!classObject) return res.status(404).send("Class not found");

    // Find all assignments with a course_id included in the class object's courses attribute and a status of "done"
    const assignments = await Assignment.find({
      course_id: { $in: classObject.courses },
      status: "missing",
    });
    if (!assignments)
      return res.status(404).send("No done assignments found for this class");

    // Return the done assignments in the class
    res.send(assignments);
  } catch (err) {
    res.status(500).send("Error retrieving done assignments for this class");
  }
});
module.exports = router;
