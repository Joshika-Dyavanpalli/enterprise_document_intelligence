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

app.use("/auth", authRoutes);

module.exports = app;