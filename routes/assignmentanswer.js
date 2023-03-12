const express = require("express");
const router = express.Router();
const { uploader } = require("../util/cloudinary");
const Assignment = require("../models/Assignment");
const AssignmentAnswer = require("../models/AssignmentAnswer");
const multer = require("multer");
const fs = require("fs");
const AssignmentAnswerFile = require("../models/AssignmentAnswerFile");

/**
 * This should be properly extracted into a utility function
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.ms-powerpoint" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-powerpoint" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    //reject file
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

// define route handler for posting an assignment answer
router.post(
  "/:assignmentId/:studentId",
  upload.array("file"),
  async (req, res) => {
    try {
      // get the assignment ID from the request params
      const { assignmentId, studentId } = req.params;

      // check if the assignment has already passed its due date
      const assignment = await Assignment.findById(assignmentId);

      const currentDate = new Date();
      if (currentDate > assignment.dueDate) {
        return res.status(400).send({ message: "Assignment is past due date" });
      }

      let uploadResult = {};
      for (const file of req.files) {
        const { path, mimetype } = file;
        const res = await uploader(path, "Assignments");
        // console.log({ cloudinary_res: res });
        //Perform logic to extract fileType
        uploadResult = { ...res, fileType: mimetype };
        fs.unlinkSync(path);
      }

      // create an AssignmentAnswerFile document with the file information
      const assignmentAnswerFile = new AssignmentAnswerFile({
        fileUrl: uploadResult.secure_url,
        fileType: uploadResult.fileType,
        fileName: uploadResult.fileName,
      });
      await assignmentAnswerFile.save();

      // create an AssignmentAnswer document with the student ID, assignment ID, and file ID
      // const studentId = req.user._id; // assuming the student ID is stored in the authenticated user object
      const assignmentAnswer = new AssignmentAnswer({
        studentId: studentId,
        assignmentId: assignmentId,
        file: assignmentAnswerFile._id,
      });
      await assignmentAnswer.save();

      // send success response
      return res
        .status(201)
        .send({ message: "Assignment answer submitted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

module.exports = router;
