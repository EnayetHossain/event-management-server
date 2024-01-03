const User = require("../model/user");
const CustomError = require("../error/customError");

const signIn = (req, res) => {
  res.status(200).json({ msg: "user login" });
};

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await User.findOne({ email });

  if (result) throw new CustomError("User already exists with this email", 403);

  try {
    const user = await User.create({ name, email, password });
    res.status(201).json({ user });
  } catch (error) {
    res
      .status(400)
      .json({ error: "All information must be provided properly" });
  }
};

module.exports = {
  signIn,
  signUp,
};
