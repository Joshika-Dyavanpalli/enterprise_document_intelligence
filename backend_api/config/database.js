const mongoose = require('mongoose');

function connectDB() {
  mongoose.connect("mongodb://127.0.0.1:27017/authDB");
  console.log('DB connected');
}

module.exports = connectDB;