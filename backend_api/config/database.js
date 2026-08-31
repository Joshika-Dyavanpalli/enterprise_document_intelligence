const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authDB")
    .then(() => {
      console.log("DB connected");
    })
    .catch((error) => {
      console.error("DB connection error:", error);
    });
}

module.exports = connectDB;
