const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name must be provided"],
    },
    email: {
      type: String,
      require: [true, "Email must be provided"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },

    password: {
      type: String,
      require: [true, "Password must be provided"],
      minLength: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
