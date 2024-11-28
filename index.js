require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.route.js");
const eventRouter = require("./routes/events.route.js");
const favoriteRouter = require("./routes/favorite.route.js");
const paymentRouter = require("./routes/payment.route.js");
const connectDB = require("./db/connect");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json({ limit: "160kb" }));
app.use(express.urlencoded({ extended: true, limit: "160kb" }));
app.use(express.static("public"));

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/favorite", favoriteRouter);
app.use("/api/v1/payment", paymentRouter);

// routes
app.get("/", (_, res) => {
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
