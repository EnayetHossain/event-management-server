const express = require("express");
const { acceptPayment, verifyPayment, acceptPaymentWithSSL, verifySSLPayment, sslSuccessHandler, generateTicketPDF } = require("../controllers/payment.controller.js");
const verifyJWT = require("../middlewares/verifyJWT.js");

const router = express.Router();

router.route("/download-ticket/:sessionId").get(verifyJWT, generateTicketPDF);
router.route("/stripe/:id").post(verifyJWT, acceptPayment);
router.route("/ssl/:id").post(verifyJWT, acceptPaymentWithSSL);
router.route("/verify/:sessionId").patch(verifyJWT, verifyPayment);
router.route("/verify/:transactionId").patch(verifyJWT, verifySSLPayment);
router.route("/ssl-success").post(sslSuccessHandler);

module.exports = router;
