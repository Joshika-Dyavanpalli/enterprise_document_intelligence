const fs = require("fs");
const Document = require("../models/documents");
const { uploadToAI, askAI } = require("../services/aiService");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "Signup Successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

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
      },
      process.env.JWT_SECRET,
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    message: "Welcome to your profile",
    user: req.user,
  });
}

module.exports = { signup, login, getProfile };

async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const aiResponse = await uploadToAI(
      req.file.path,
      req.file.originalname
    );

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

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document: savedDocument,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

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

    return res.status(200).json({
      success: true,
      answer: aiResponse.answer,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

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

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(id);

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

module.exports = {
  signup,
  login,
  getProfile,
  uploadDocument,
  askQuestion,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};
