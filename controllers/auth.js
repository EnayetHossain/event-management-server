require("dotenv").config();
const User = require("../model/user");
const CustomError = require("../error/customError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new CustomError("Provide all credentials", 400);

  const user = await User.findOne({ email });

  if (!user) throw new CustomError("User not found", 403);

  try {
    const isMatch = await bcrypt.compare(password, user.password);

    if (user.email !== email || !isMatch)
      return res
        .status(401)
        .json({ status: "Failed", error: "Email or password is not correct" });

    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "2d",
    });

    res.status(200).json({ status: "Success", token });
  } catch (error) {
    res.status(400).json({ status: "Failed", error });
  }
};

// register the user.
const signUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const result = await User.findOne({ email });

  if (result) throw new CustomError("User already exists with this email", 403);

  if (!name || !email || !password || !confirmPassword)
    throw new CustomError("All fields are required", 400);

  if (password !== confirmPassword)
    throw new CustomError("Password and confirm password doesn't match", 403);

  try {
    // generate salt for password
    const salt = await bcrypt.genSalt(12);
    // hash the password
    const hashedPassword = await bcrypt.hash(password, salt);
    // create a user on the database
    const user = await User.create({ name, email, password: hashedPassword });
    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "2d",
    });

    res.status(201).json({ status: "Success", token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "Failed", error });
  }
};

module.exports = {
  signIn,
  signUp,
};
