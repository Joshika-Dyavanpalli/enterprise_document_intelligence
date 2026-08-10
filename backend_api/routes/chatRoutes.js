const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNewChat,
  askQuestion,
  getChatHistory,
} = require("../controllers/chatController");

// Create a new chat
router.post("/new", authMiddleware, createNewChat);

// Ask question in a specific chat
router.post("/ask", authMiddleware, askQuestion);

// Get specific chat history
router.get("/history/:chatId", authMiddleware, getChatHistory);

module.exports = router;
