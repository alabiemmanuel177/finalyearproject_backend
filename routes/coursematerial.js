const express = require("express");
const router = express.Router();
const multer = require("multer");
const CourseMaterial = require("../models/CourseMaterial");
const CourseMaterialFile = require("../models/CourseMaterialFile");
const fs = require("fs");
const { uploader } = require("../util/cloudinary");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/CourseMaterials");
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
    file.mimetype === "video/x-flv" ||
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/3gpp" ||
    file.mimetype === "audio/mp4" ||
    file.mimetype === "audio/mpeg" ||
    file.mimetype === "audio/x-aiff" ||
    file.mimetype === "video/quicktime" ||
    file.mimetype === "text/html"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 },
  fileFilter: fileFilter,
});

// POST route to add course material
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { IOconn } = req;
    const { course, title, description } = req.body;

    let uploadResults = [];
    let uploadResult = {};
    for (const file of req.files) {
      const { path, mimetype } = file;
      const res = await uploader(path, "BUCODEL/Course Materials");
      // console.log({ cloudinary_res: res });
      //Perform logic to extract fileType
      uploadResult = { ...res, fileType: mimetype };
      uploadResults.push(uploadResult);
      fs.unlinkSync(path);
    }

    const fileIds = [];
    for (const uploadResult of uploadResults) {
      const courseMaterialFile = new CourseMaterialFile({
        fileUrl: uploadResult.secure_url,
        fileType: uploadResult.fileType,
        fileName: uploadResult.fileName,
      });
      await courseMaterialFile.save();
      fileIds.push(courseMaterialFile._id);
    }

    const newCourseMaterial = new CourseMaterial({
      course,
      title,
      description,
      files: fileIds,
    });
    const savedCourseMaterial = await newCourseMaterial.save();

    IOconn.emit("LECTURER_UPLOADED_NEW_COURSES", "OK");
    res.status(201).json(savedCourseMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error uploading course material" });
  }
});

// Route for getting all course materials for a particular course
router.get("/course/:id/materials", (req, res) => {
  CourseMaterial.find({ courseId: req.params.id }, (err, materials) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(materials);
    }
  }).populate("course");
});

//Route to get a particular course material
router.get("/:id", async (req, res) => {
  try {
    const courseMaterial = await CourseMaterial.findById(req.params.id);
    if (!courseMaterial)
      return res.status(404).send("Course Material not found");
    res.send(courseMaterial);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Route to update a course material
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updatedMaterial = req.body;

  CourseMaterial.findByIdAndUpdate(
    id,
    updatedMaterial,
    { new: true },
    (err, material) => {
      if (err) return res.status(500).send(err);
      if (!material)
        return res.status(404).send({ message: "Course Material not found" });

      return res.send(material);
    }
  );
});

// Route to delete a course material
router.delete("/course/:id", async (req, res) => {
  try {
    const coursematerialId = req.params.id;
    const coursematerial = await CourseMaterial.findOne({ coursematerialId });

    if (!coursematerial) {
      return res.status(404).json({ message: "Course Material not found" });
    }

    // Delete files from file storage
    coursematerial.files.forEach((file) => {
      fs.unlinkSync(file.filepath);
    });

    // Delete course from database
    await coursematerial.remove();
    res.status(200).json({ message: "Course Material deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error couldn't delete course material" });
  }
});

// GET route to get a particular file by ID
router.get("/:coursematerialId/file/:fileId", async (req, res) => {
  try {
    const { coursematerialId, fileId } = req.params;
    const coursematerial = await CourseMaterial.findOne({ coursematerialId });
    if (!coursematerial) {
      return res.status(404).json({ message: "Course Material not found" });
    }
    const file = coursematerial.files.find(
      (file) => file._id.toString() === fileId.toString()
    );
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(200).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
