const express = require("express");
const { signIn, signUp, changePassword } = require("../controllers/auth");
const verifyJWT = require("../middlewares/verifyJWT.js");
const upload = require("../middlewares/multer.js");
const router = express.Router();

router.route("/sign-in").post(signIn);
router.route("/sign-up").post(
  upload.fields([
    {
      name: "profilePhoto", // this name should match the field name in the frontend
      maxCount: 1,
      optional: true,
    },
    {
      name: "coverPhoto", // this name should match the field name in the frontend
      maxCount: 1,
      optional: true,
    },
  ]),
  signUp
);
router.route("/change-password").patch(verifyJWT, changePassword);

module.exports = router;
