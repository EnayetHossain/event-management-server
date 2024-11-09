const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event id is required"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required"]
  }
}, {timestamps: true});


module.exports = mongoose.model("Favorite", favoriteSchema);
