const Chat = require("../models/Chat");
const Document = require("../models/documents");
const { askAI } = require("../services/aiService");
const redisConnection = require("../config/redis");

// ======================================================
// CREATE NEW CHAT
// ======================================================

async function createNewChat(req, res) {
  try {
    const { documentId } = req.body;

    const chatData = {
      userId: req.user.id,
      title: "New Chat",
      documents: [],
      messages: [],
    };

    // Attach existing document if provided
    if (documentId) {
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      chatData.documents.push(document._id);
      chatData.title = document.originalName;
    }

    const chat = await Chat.create(chatData);

    return res.status(201).json({
      success: true,
      message: "New chat created",

      chat: {
        _id: chat._id,
        title: chat.title,
        documents: chat.documents,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.log("CREATE CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create new chat",
    });
  }
}

// ======================================================
// GET ALL CHATS
// ======================================================

async function getAllChats(req, res) {
  try {
    const chats = await Chat.find({
      userId: req.user.id,
    })
      .populate("documents", "originalName fileType")
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log("GET ALL CHATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load chats",
    });
  }
}

// ======================================================
// GET ONE CHAT
// ======================================================

async function getChatHistory(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id,
    }).populate("documents", "originalName fileType");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      title: chat.title,
      messages: chat.messages,
      documents: chat.documents,
    });
  } catch (error) {
    console.log("GET CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load chat history",
    });
  }
}

// ======================================================
// ASK QUESTION
// ======================================================

async function askQuestion(req, res) {
  try {
    const { chatId, documentId, question } = req.body;

    if (!chatId || !documentId || !question) {
      return res.status(400).json({
        success: false,
        message: "Chat ID, Document ID and Question are required",
      });
    }

    // Find exact chat belonging to logged-in user
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Find document belonging to logged-in user
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Make sure document belongs to this chat
    const attached = chat.documents.some(
      (id) => id.toString() === documentId.toString(),
    );

    if (!attached) {
      return res.status(400).json({
        success: false,
        message: "Document is not attached to this chat",
      });
    }

    // Create a unique cache key for this document + question
    const cacheKey = `qa:${documentId}:${question.trim().toLowerCase()}`;

    // Check Redis cache first
    const cachedAnswer = await redisConnection.get(cacheKey);

    let answer;

    if (cachedAnswer) {
      console.log("CACHE HIT:", cacheKey);

      answer = cachedAnswer;
    } else {
      console.log("CACHE MISS:", cacheKey);

      const aiResponse = await askAI(
        document.vectorPath,
        document.chunksPath,
        question.trim(),
      );

      answer = aiResponse.answer;

      // Store answer in Redis for 1 hour
      await redisConnection.set(cacheKey, answer, "EX", 3600);
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: question.trim(),
    });

    // Save assistant message
    chat.messages.push({
      role: "assistant",
      content: answer,
    });

    // Change title based on first question
    if (chat.title === "New Chat") {
      chat.title =
        question.trim().length > 40
          ? question.trim().substring(0, 40) + "..."
          : question.trim();
    }

    await chat.save();

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      answer: answer,
      messages: chat.messages,
    });
  } catch (error) {
    console.log("ASK QUESTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process question",
    });
  }
}

module.exports = {
  createNewChat,
  getAllChats,
  getChatHistory,
  askQuestion,
};
