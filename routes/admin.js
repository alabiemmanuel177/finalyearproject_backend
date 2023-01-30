const router = require("express").Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const  generateOTP = require("../generateOTP")

//UPDATE ADMIN
router.put("/:id", async (req, res) => {
  if (req.body.adminId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedAdmin);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can only update your account!");
  }
});

//DELETE ADMIN
router.delete("/:id", async (req, res) => {
  if (req.body.adminId === req.params.id) {
    try {
      const admin = await Admin.findById(req.params.id);
      try {
        await admin.findByIdAndDelete(req.params.id);
        return res.status(200).json("Admin has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } catch {
      return res.status(404).json("Admin Cannot be found!");
    }
  } else {
    return res.status(401).json("You can only delete your account!");
  }
});

//GET ADMIN
router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    const { password, ...others } = admin._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//CHANGE PASSWORD ADMIN

router.post("/reset", async (req, res) => {
  const { email } = req.body;

  // Find the user with the given email
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).send({ error: "Invalid email" });

  // Generate and send an OTP
  const otp = generateOTP();
  sendOTP(admin.email, otp);

  // Save the OTP in the user's database record
  admin.otp = otp;
  await admin.save();

  res.send({ message: "OTP sent" });
});

router.post("/reset/verify", async (req, res) => {
  const { email, otp, password } = req.body;

  // Find the user with the given email
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).send({ error: "Invalid email" });

  // Check if the OTP is correct
  if (admin.otp !== otp) return res.status(400).send({ error: "Invalid OTP" });

  // Update the user's password
  admin.password = password;
  await admin.save();

  res.send({ message: "Password updated" });
});

// app.post("/change-password", async (req, res) => {
//   try {
//     const admin = await Admin.findOne({ username: req.body.username });
//     const passwordHash = admin.password;
//     const isValid = await bcrypt.compare(req.body.oldPassword, passwordHash);
//     if (isValid) {
//       const hashedPassword = await bcrypt.hash(req.body.newPassword);
//       user.password = hashedPassword;
//       await user.save();

//       return res.send({ message: "Password changed successfully" });
//     }
//     return res.status(400).json("Password do not match");
//   } catch (error) {
//     return res.status(500).json(err);
//   }
// });

module.exports = router;
