const router = require("express").Router();
const Department = require("../models/Department");

//CREATE DEPARTMENT
router.post("/", async (req, res) => {
  const { IOconn } = req;
  const newDepartment = new Department(req.body);
  try {
    const savedDepartment = await newDepartment.save();
    IOconn.emit("NEW_DEPARTMENT_POSTED", "OK");
    return res.status(200).json(savedDepartment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE DEPARTMENT
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("DEPARTMENT_UPDATED", "OK");
    return res.status(200).json(updatedDepartment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE DEPARTMENT
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const department = await Department.findById(req.params.id);
    await department.delete();
    IOconn.emit("DEPARTMENT_DELETED", "OK");
    return res.status(200).json("Department has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET DEPARTMENT
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    return res.status(200).json(department);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL DEPARTMENT
router.get("/", async (req, res) => {
  try {
    let departments;
    departments = await Department.find();
    return res.status(200).json(departments);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH DEPARTMENT
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      {
        $push: req.body,
      }
    );
    IOconn.emit("DEPARTMENT_UPDATED", "OK");
    return res.status(200).json(updatedDepartment);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
