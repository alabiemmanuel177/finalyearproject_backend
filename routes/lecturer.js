const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Lecturer = require("../models/Lecturer");

//UPDATE LECTURER
router.put("/:id", async (req, res) => {
  if (req.body.lecturerId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedLecturer = await Lecturer.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedLecturer);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE LECTURER
router.delete("/:id", async (req, res) => {
  if (req.body.lecturerId === req.params.id) {
    try {
      const lecturer = await Lecturer.findById(req.params.id);
      try {
        await Lecturer.findByIdAndDelete(req.params.id);
        return res.status(200).json("Lecturer has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Lecturer Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET LECTURER
router.get("/:id", async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    const { password, ...others } = lecturer._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//CHANGE PASSWORD LECTURER
router.post("/reset", async (req, res) => {
  const { email } = req.body;

  // Find the lecturer with the given email
  const lecturer = await Lecturer.findOne({ email });
  if (!lecturer) return res.status(400).send({ error: "Invalid email" });

  // Generate and send an OTP
  const otp = generateOTP();
  sendOTP(lecturer.email, otp);

  // Save the OTP in the lecturer's database record
  lecturer.otp = otp;
  await lecturer.save();

  res.send({ message: "OTP sent" });
});

router.post("/reset/verify", async (req, res) => {
  const { email, otp, password } = req.body;

  // Find the lecturer with the given email
  const lecturer = await Lecturer.findOne({ email });
  if (!lecturer) return res.status(400).send({ error: "Invalid email" });

  // Check if the OTP is correct
  if (lecturer.otp !== otp)
    return res.status(400).send({ error: "Invalid OTP" });

  // Update the lecturer's password
  lecturer.password = password;
  await lecturer.save();

  res.send({ message: "Password updated" });
});

module.exports = router;
