require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const connectDB = require("./db/connect");

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

const start = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    const connection = await connectDB(process.env.MONGODB_URI);
    console.log(connection);
    app.listen(port, console.log("visit http://localhost:5000"));
  } catch (error) {
    console.log(error);
  }
};

start();
