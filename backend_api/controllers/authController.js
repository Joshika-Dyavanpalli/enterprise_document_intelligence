const fs = require("fs");

const Document = require("../models/documents");
const Chat = require("../models/Chat");
const User = require("../models/User.js");

const { uploadToAI } = require("../services/aiService");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/*
  SIGNUP
*/
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Viewer",
    });

    return res.status(201).json({
      success: true,
      message: "Signup Successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  LOGIN
*/
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password does not match",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  PROFILE
*/
function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    message: "Welcome to your profile",
    user: req.user,
  });
}

/*
  UPLOAD DOCUMENT

  IMPORTANT:

  chatId is required.

  The uploaded document is:
  1. processed by AI service
  2. saved in Document collection
  3. attached to the CURRENT chat

  This fixes:

  New Chat
      ↓
  Upload
      ↓
  return to same chat
      ↓
  document is already available
*/
async function uploadDocument(req, res) {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Check chat belongs to logged-in user
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

    // Send file to AI service
    const aiResponse = await uploadToAI(req.file.path, req.file.originalname);

    // Save document
    const savedDocument = await Document.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      extractedText: aiResponse.text,
      vectorPath: aiResponse.vector_path,
      chunksPath: aiResponse.chunks_path,
      chunkCount: aiResponse.chunk_count,
    });

    // Attach document to THIS chat
    chat.documents.push(savedDocument._id);

    await chat.save();

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document: savedDocument,
      chatId: chat._id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  GET ALL DOCUMENTS
*/
async function getAllDocuments(req, res) {
  try {
    const documents = await Document.find(
      {
        userId: req.user.id,
      },
      {
        extractedText: 0,
      },
    ).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  GET ONE DOCUMENT
*/
async function getDocumentById(req, res) {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  DELETE DOCUMENT
*/
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete physical file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document
    await Document.findByIdAndDelete(id);

    // Remove document from chats
    await Chat.updateMany(
      {
        userId: req.user.id,
      },
      {
        $pull: {
          documents: id,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  GET ALL USERS
*/
async function getAllUsers(req, res) {
  try {
    const users = await User.find(
      {},
      {
        password: 0,
      },
    ).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/*
  UPDATE USER ROLE
*/
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["Admin", "Editor", "Viewer"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Prevent admin from changing own role
    if (req.user.id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
  signup,
  login,
  getProfile,
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getAllUsers,
  updateUserRole,
};
