const express = require("express");
const {
  addEvent,
  getAllEvents,
  getEventByUserId,
  getSingleEventById,
} = require("../controllers/events.controller.js");
const verifyJWT = require("../middlewares/verifyJWT.js");
const upload = require("../middlewares/multer.js");

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
).get(getAllEvents);

router.route("/getEventByUser").get(verifyJWT, getEventByUserId);
// keep the parameter path at the bottom always
router.route("/:id").get(getSingleEventById);

module.exports = router;
