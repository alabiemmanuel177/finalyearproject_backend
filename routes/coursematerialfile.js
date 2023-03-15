const router = require("express").Router();
const CourseMaterialFile = require("../models/CourseMaterialFile");

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const coursematerialfile = await CourseMaterialFile.findById(req.params.id);
    return res.status(200).json(coursematerialfile);
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
