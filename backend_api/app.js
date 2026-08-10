require("dotenv").config();

const cors = require("cors");
const express = require("express");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

module.exports = app;
