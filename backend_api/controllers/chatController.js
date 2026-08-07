const Chat = require("../models/Chat");
const Document = require("../models/documents");
const { askAI } = require("../services/aiService");

async function askQuestion(req, res) {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        message: "Document ID and Question are required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const aiResponse = await askAI(
      document.vectorPath,
      document.chunksPath,
      question,
    );

    let chat = await Chat.findOne({
      userId: req.user.id,
      documentId,
    });

    if (!chat) {
      chat = await Chat.create({
        userId: req.user.id,
        documentId,
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: question,
    });

    chat.messages.push({
      role: "assistant",
      content: aiResponse.answer,
    });

    await chat.save();

    return res.status(200).json({
      success: true,
      answer: aiResponse.answer,
      messages: chat.messages,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function getChatHistory(req, res) {
  try {
    const { documentId } = req.params;

    const chat = await Chat.findOne({
      userId: req.user.id,
      documentId,
    });

    if (!chat) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: chat.messages,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  askQuestion,
  getChatHistory,
};
