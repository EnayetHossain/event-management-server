const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name must be provided"],
    },

    email: {
      type: String,
      required: [true, "Email must be provided"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password must be provided"],
      minLength: 6,
    },

    profilePhoto: {
      type: String,
      default:
        "https://cdn.dribbble.com/users/760319/screenshots/3907189/man.png?resize=400x0",
    },

    coverPhoto: {
      type: String,
      default: "https://www.color-hex.com/palettes/29882.png",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
