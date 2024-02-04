const express = require("express");
const { signIn, signUp, changePassword } = require("../controllers/auth");
const verifyJWT = require("../middlewares/verifyJWT.js");
const upload = require("../middlewares/multer.js");
const router = express.Router();

router.route("/sign-in").post(signIn);
router.route("/sign-up").post(
  upload.fields([
    {
      name: "profilePhoto",
      maxCount: 1,
    },
    {
      name: "coverPhoto",
      maxCount: 1,
    },
  ]),
  signUp
);
router.route("/change-password").patch(verifyJWT, changePassword);

module.exports = router;
