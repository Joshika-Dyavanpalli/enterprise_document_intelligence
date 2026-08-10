const Chat = require("../models/Chat");
const Document = require("../models/documents");
const { askAI } = require("../services/aiService");

/*
  CREATE NEW CHAT

  documentId is optional.

  If documentId is provided:
  - verify document belongs to logged-in user
  - attach document to the new chat

  This supports:

  My Documents → Open Chat
*/
async function createNewChat(req, res) {
  try {
    const { documentId } = req.body;

    const chatData = {
      userId: req.user.id,
      documents: [],
      messages: [],
    };

    // If an existing document was selected
    if (documentId) {
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

      chatData.documents.push(documentId);
    }

    const chat = await Chat.create(chatData);

    return res.status(201).json({
      success: true,
      message: "New chat created",
      chat: {
        _id: chat._id,
        documents: chat.documents,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to create new chat",
    });
  }
}

/*
  ASK QUESTION

  The question belongs to the specific chatId sent
  by the frontend.

  We DO NOT search for the latest chat.
*/
async function askQuestion(req, res) {
  try {
    const { chatId, documentId, question } = req.body;

    if (!chatId || !documentId || !question) {
      return res.status(400).json({
        success: false,
        message: "Chat ID, Document ID and Question are required",
      });
    }

    // Find the specific chat
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

    // Verify document belongs to logged-in user
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

    // Make sure document is attached to this chat
    const documentAlreadyAdded = chat.documents.some(
      (id) => id.toString() === documentId.toString(),
    );

    if (!documentAlreadyAdded) {
      return res.status(400).json({
        success: false,
        message: "This document is not attached to this chat",
      });
    }

    // Ask AI
    const aiResponse = await askAI(
      document.vectorPath,
      document.chunksPath,
      question,
    );

    // Save user question
    chat.messages.push({
      role: "user",
      content: question,
    });

    // Save AI answer
    chat.messages.push({
      role: "assistant",
      content: aiResponse.answer,
    });

    await chat.save();

    return res.status(200).json({
      success: true,
      answer: aiResponse.answer,
      messages: chat.messages,
      chatId: chat._id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to process question",
    });
  }
}

/*
  GET ONE SPECIFIC CHAT

  Important:
  We return chatId requested by frontend.

  We DO NOT return the user's latest chat.
*/
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
      messages: chat.messages,
      documents: chat.documents,
      chatId: chat._id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load chat history",
    });
  }
}

module.exports = {
  createNewChat,
  askQuestion,
  getChatHistory,
};
