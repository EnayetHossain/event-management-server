require("dotenv").config();
const CustomError = require("../error/customError");
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer"))
    throw new CustomError(
      "You are not authorized to perform this operation",
      401
    );

  // extract the token
  const token = authorization.split(" ")[1];
  // verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) throw new CustomError("invalid token", 500);

    req.decoded = decoded;
    next();
  });
};

module.exports = verifyJWT;
