const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNewChat,
  getAllChats,
  askQuestion,
  getChatHistory,
} = require("../controllers/chatController");

router.post("/new", authMiddleware, createNewChat);

router.get("/", authMiddleware, getAllChats);

router.post("/ask", authMiddleware, askQuestion);

router.get("/history/:chatId", authMiddleware, getChatHistory);

module.exports = router;
