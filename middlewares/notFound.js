const notFound = (req, res) =>
  res.status(404).json({ msg: "route doesn't exists" });

module.exports = notFound;
