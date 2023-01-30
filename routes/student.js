const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

//UPDATE STUDENT
router.put("/:id", async (req, res) => {
  if (req.body.studentId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedStudent);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE STUDENT
router.delete("/:id", async (req, res) => {
  if (req.body.studentId === req.params.id) {
    try {
      const student = await Student.findById(req.params.id);
      try {
        await Lecturer.findByIdAndDelete(req.params.id);
        return res.status(200).json("Student has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Student Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET STUDENT
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { password, ...others } = student._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//CHANGE PASSWORD STUDENT
router.post("/reset", async (req, res) => {
  const { email } = req.body;

  // Find the student with the given email
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).send({ error: "Invalid email" });

  // Generate and send an OTP
  const otp = generateOTP();
  sendOTP(student.email, otp);

  // Save the OTP in the student's database record
  student.otp = otp;
  await student.save();

  res.send({ message: "OTP sent" });
});

router.post("/reset/verify", async (req, res) => {
  const { email, otp, password } = req.body;

  // Find the student with the given email
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).send({ error: "Invalid email" });

  // Check if the OTP is correct
  if (student.otp !== otp)
    return res.status(400).send({ error: "Invalid OTP" });

  // Update the student's password
  student.password = password;
  await student.save();

  res.send({ message: "Password updated" });
});

module.exports = router;
