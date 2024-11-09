const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const { addToFavorite, getFavorites, getFavoritesByEventIdAndUserId} = require("../controllers/favorite.controller.js");

const router = express.Router();

router.route("/").get(verifyJWT, getFavorites);
router.route("/:id").post(verifyJWT, addToFavorite).get(verifyJWT, getFavoritesByEventIdAndUserId);

module.exports = router;
