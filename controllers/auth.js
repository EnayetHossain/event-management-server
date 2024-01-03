const signIn = (req, res) => {
  res.status(200).json({ msg: "user login" });
};

const signUp = (req, res) => {
  res.status(200).json({ msg: "user created" });
};

module.exports = {
  signIn,
  signUp,
};
