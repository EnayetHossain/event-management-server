const express = require("express");
const {
  addEvent,
  getAllEvents,
  getEventByUserId,
} = require("../controllers/events");
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

router.route("/").get(getAllEvents);
router.route("/getEventByUser").get(verifyJWT, getEventByUserId);

module.exports = router;
