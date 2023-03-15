const router = require("express").Router();
const ClassPost = require("../models/ClassPost");
const Lecturer = require("../models/Lecturer");
const Student = require("../models/Student");

//CREATE CLASSPOST
router.post("/", async (req, res) => {
  const { IOconn } = req;
  const newClassPost = new ClassPost(req.body);
  try {
    const savedClassPost = await newClassPost.save();
    IOconn.emit("NEW_CLASSPOST_POSTED", "OK");
    return res.status(200).json(savedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//UPDATE CLASSPOST
router.put("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedClassPost = await ClassPost.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    IOconn.emit("CLASSPOST_UPDATED", "OK");
    return res.status(200).json(updatedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//DELETE CLASSPOST
router.delete("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const classPost = await ClassPost.findById(req.params.id);
    await classPost.delete();
    IOconn.emit("CLASSPOST_DELETED", "OK");
    return res.status(200).json("Class Post has been deleted...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const classPost = await ClassPost.findById(req.params.id);
    return res.status(200).json(classPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL CLASSPOST
router.get("/", async (req, res) => {
  try {
    let classPosts;
    classPosts = await ClassPost.find();
    return res.status(200).json(classPosts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//PATCH CLASSPOST
router.patch("/:id", async (req, res) => {
  const { IOconn } = req;
  try {
    const updatedClassPost = await ClassPost.findByIdAndUpdate(req.params.id, {
      $push: req.body,
    });
    IOconn.emit("CLASSPOST_UPDATED", "OK");
    return res.status(200).json(updatedClassPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Route to get all posts for a specific course
router.get("/posts/:courseId", async (req, res) => {
  try {
    // Find all posts for the specific course
    const posts = await ClassPost.find({ course: req.params.courseId });
    if (!posts) return res.status(404).send("No posts found for this course");

    // Create an array to store the post content and author information
    const postData = [];

    // Loop through all posts and retrieve the author information
    for (const post of posts) {
      let author = {};
      if (post.student_id) {
        // If the post was created by a student, find the student and return their information
        const student = await Student.findById(post.student_id);
        const studentName = `${student.firstname} ${student.lastname} ${student.middlename}`;
        author = {
          id: student._id,
          name: studentName,
          email: student.email,
        };
      } else if (post.lecturer_id) {
        // If the post was created by a lecturer, find the lecturer and return their information
        const lecturer = await Lecturer.findById(post.lecturer_id);
        author = {
          id: lecturer._id,
          name: lecturer.name,
          email: lecturer.email,
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

module.exports = router;
