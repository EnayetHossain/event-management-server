const notFound = (req, res) =>
  res.status(404).json({ error: "route doesn't exists" });

module.exports = notFound;
