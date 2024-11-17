const express = require("express");
const {
  addEvent,
  updateEvent,
  deleteEvent,
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
//NOTE: keep the parameter path at the bottom ALWAYS
router.route("/:id").get(getSingleEventById).patch(
  verifyJWT,
  upload.fields([
    {
      name: "eventPhoto", //NOTE: this name should match the field name in the frontend
      maxCount: 1,
      optional: true,
    },
  ]),
  updateEvent
).delete(verifyJWT, deleteEvent);

module.exports = router;
