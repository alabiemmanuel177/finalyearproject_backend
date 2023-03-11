const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const AssignmentAnswerFile = require("../models/AssignmentAnswer");

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// define route handler for posting an assignment answer
router.post("/:id/:studentId", async (req, res) => {
  try {
    // get the assignment ID from the request params
    const assignmentId = req.params.id;

    // check if the assignment has already passed its due date
    const assignment = await Assignment.findById(assignmentId);
    const currentDate = new Date();
    if (currentDate > assignment.dueDate) {
      return res.status(400).send({ message: "Assignment is past due date" });
    }

    // check if file is present in the request
    if (!req.files || !req.files.file) {
        return res.status(400).send("No file uploaded");
      }

    // upload file to cloudinary and get the file URL, name, and type
    const file = req.files.file;
    const fileType = file.mimetype;
    const allowedFileTypes = [
      ".jpg",
      ".png",
      ".webp",
      ".jpeg",
      ".ppt",
      ".pptx",
      "docx",
      "xlsx",
    ];
    if (!allowedFileTypes.includes(fileType)) {
      return res
        .status(400)
        .send({
          message:
            "Invalid file type. Allowed file types are .jpg, .png, .webp, .jpeg, .ppt, .pptx, docx, xlsx",
        });
    }
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    const fileUrl = result.secure_url;
    const fileName = result.original_filename;

    // create an AssignmentAnswerFile document with the file information
    const assignmentAnswerFile = new AssignmentAnswerFile({
      fileUrl,
      fileType,
      fileName,
    });
    await assignmentAnswerFile.save();

    // create an AssignmentAnswer document with the student ID, assignment ID, and file ID
    // const studentId = req.user._id; // assuming the student ID is stored in the authenticated user object
    const assignmentAnswer = new AssignmentAnswer({
      studentId,
      assignmentId,
      file: assignmentAnswerFile._id,
    });
    await assignmentAnswer.save();

    // send success response
    res
      .status(201)
      .send({ message: "Assignment answer submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
