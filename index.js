require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const connectDB = require("./db/connect");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/v1/auth", authRouter);

// routes
app.get("/", (req, res) => {
  res.send("server running");
});

// error handler
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(
      port,
      console.log("connected to database visit http://localhost:5000")
    );
  } catch (error) {
    console.log(error);
  }
};

start();
