const express = require("express");
const { acceptPayment, verifyPayment } = require("../controllers/payment.controller.js");
const verifyJWT = require("../middlewares/verifyJWT.js");

const router = express.Router();

router.route("/:id").post(verifyJWT, acceptPayment);
router.route("/verify/:sessionId").patch(verifyJWT, verifyPayment);

module.exports = router;
