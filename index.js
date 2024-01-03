require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");

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

app.listen(port, console.log("visit http://localhost:5000"));
