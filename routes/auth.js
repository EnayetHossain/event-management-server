const express = require("express");
const { signIn, signUp, changePassword } = require("../controllers/auth");
const verifyJWT = require("../middlewares/verifyJWT.js");

const router = express.Router();

router.route("/sign-in").post(signIn);
router.route("/sign-up").post(signUp);
router.route("/change-password").patch(verifyJWT, changePassword);

module.exports = router;
