const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  askQuestion,
  getChatHistory,
} = require("../controllers/chatController");

router.post("/ask", authMiddleware, askQuestion);

router.get("/history/:documentId", authMiddleware, getChatHistory);

module.exports = router;
