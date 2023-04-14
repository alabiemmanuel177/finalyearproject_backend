const router = require("express").Router();
const GroupComment = require("../models/GroupComment");
const GroupPost = require("../models/GroupPost");
const GroupMaterialFile = require("../models/GroupMaterialFile");
const Lecturer = require("../models/Lecturer");
const Student = require("../models/Student");
const fs = require("fs");
const { uploader, multipleUploader } = require("../util/cloudinary");
const multer = require("multer");
const Group = require("../models/Group");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/Group Materials");
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
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/3gpp" ||
    file.mimetype === "audio/mp4" ||
    file.mimetype === "audio/mpeg" ||
    file.mimetype === "text/html"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: fileFilter,
});

// POST route to add course material
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { IOconn } = req;
    const { course, content, group, student_id, lecturer_id } = req.body;

    let uploadResults = [];
    let uploadResult = {};
    for (const file of req.files) {
      const path = file.path;
      const mimetype = file.mimetype;
      const res = await multipleUploader(path, "BUCODEL/Group Materials");
      //Perform logic to extract fileType
      uploadResult = { ...res, fileType: mimetype };
      uploadResults.push(uploadResult);
      fs.unlinkSync(path);
    }

    const fileIds = [];
    for (const uploadResult of uploadResults) {
      const groupMaterialFile = new GroupMaterialFile({
        fileUrl: uploadResult.secure_url,
        fileType: uploadResult.fileType,
        fileName: uploadResult.fileName,
        public_id: uploadResult.id,
      });
      await groupMaterialFile.save();
      fileIds.push(groupMaterialFile._id);
    }

    const newGroupPost = new GroupPost({
      course,
      content,
      group,
      student_id,
      lecturer_id,
      files: fileIds,
    });
    const savedGroupPost = await newGroupPost.save();

    IOconn.emit("NEW_GROUPMATERIAL_POSTED", "OK");
    res.status(201).json(savedGroupPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error uploading course material" });
  }
});

//UPDATE CLASSPOST
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedGroupPost = await GroupPost.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("GROUPPOST_UPDATED", "OK");
    return res.status(200).json(updatedGroupPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASSPOST
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const groupPost = await GroupPost.findById(req.params.id);
    await groupPost.delete();
    IOconn.emit("GROUPPOST_DELETED", "OK");
    return res.status(200).json("Group Post has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const groupPost = await GroupPost.findById(req.params.id)
      .populate("group")
      .populate("course")
      .populate("files")
      .populate("student_id")
      .populate("lecturer_id");
    return res.status(200).json(groupPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Route to get all Group Posts for a particular group
router.get("/group/:groupId/", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const groupPosts = await GroupPost.find({ group: groupId }).populate(
      "course group files lecturer_id"
    );
    res.json(groupPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//GET ALL CLASSPOST
router.get("/", async (req, res) => {
  try {
    let groupPosts;
    groupPosts = await GroupPost.find()
      .sort({ createdAt: -1 })
      .populate("group")
      .populate("course")
      .populate("files")
      .populate("student_id")
      .populate("lecturer_id");
    return res.status(200).json(groupPosts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASSPOST
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedGroupPost = await GroupPost.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    IOconn.emit("GROUPPOST_UPDATED", "OK");
    return res.status(200).json(updatedGroupPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Route to get all posts for a specific course
router.get("/posts/:groupId", async (req, res) => {
  try {
    // Find all posts for the specific course
    const posts = await GroupPost.find({ course: req.params.groupId }).sort({
      createdAt: -1,
    });
    if (!posts) return res.status(404).send("No posts found for this course");

    // Create an array to store the post content and author information
    const postData = [];

    // Loop through all posts and retrieve the author information
    for (const post of posts) {
      let author = {};
      if (post.student_id) {
        // If the post was created by a student, find the student and return their information
        const student = await Student.findById(post.student_id).populate(
          "profilePic"
        );
        const studentName = `${student.firstname} ${student.lastname} ${student.middlename}`;
        author = {
          id: student._id,
          name: studentName,
          email: student.email,
          profilePic: student.profilePic,
        };
      } else if (post.lecturer_id) {
        // If the post was created by a lecturer, find the lecturer and return their information
        const lecturer = await Lecturer.findById(post.lecturer_id).populate(
          "profilePic"
        );
        author = {
          id: lecturer._id,
          name: lecturer.name,
          email: lecturer.email,
          profilePic: lecturer.profilePic,
        };
      }

      // Add the post content and author information to the postData array
      postData.push({ content: post, author });
    }

    // Return the postData array
    res.send(postData);
  } catch (err) {
    res.status(500).send("Error retrieving posts for this course");
  }
});

// Route to get all comments for a particular class post
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await GroupComment.find({ groupPost: req.params.id });
    const commentData = [];

    for (const comment of comments) {
      let author = {};
      if (comment.student_id) {
        // If the post was created by a student, find the student and return their information
        const student = await Student.findById(comment.student_id).populate(
          "profilePic"
        );
        const studentName = `${student.firstname} ${student.lastname} ${student.middlename}`;
        author = {
          id: student._id,
          name: studentName,
          email: student.email,
          profilePic: student.profilePic,
        };
      } else if (comment.lecturer_id) {
        // If the post was created by a lecturer, find the lecturer and return their information
        const lecturer = await Lecturer.findById(comment.lecturer_id).populate(
          "profilePic"
        );
        author = {
          id: lecturer._id,
          name: lecturer.name,
          email: lecturer.email,
          profilePic: lecturer.profilePic,
        };
      }

      // Add the post content and author information to the postData array
      commentData.push({ content: comment, author });
    }
    // Return the postData array
    res.send(commentData);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
