const express = require("express");
const { addEvent } = require("../controllers/events");
const verifyJWT = require("../middlewares/verifyJWT");
const upload = require("../middlewares/multer");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.fields([
    {
      name: "eventPhoto",
      maxCount: 1,
      optional: true,
    },
  ]),
  addEvent
);

module.exports = router;
