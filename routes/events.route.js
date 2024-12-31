const express = require("express");
const {
  addEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventByUserId,
  getSingleEventById,
  getFeaturedEvent,
  removeFeaturedEvent
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
router.route("/featured").get(getFeaturedEvent);

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
router.route("/featured/:id").patch(removeFeaturedEvent);

module.exports = router;
