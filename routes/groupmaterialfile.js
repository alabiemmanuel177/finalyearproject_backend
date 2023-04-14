const router = require("express").Router();
const GroupMaterialFile = require("../models/GroupMaterialFile");

//GET CLASSPOST
router.get("/:id", async (req, res) => {
  try {
    const groupMaterialfile = await GroupMaterialFile.findById(req.params.id);
    return res.status(200).json(groupMaterialfile);
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
