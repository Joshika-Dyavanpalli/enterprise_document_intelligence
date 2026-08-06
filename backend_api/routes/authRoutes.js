const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const {
  signup,
  login,
  getProfile,
  uploadDocument,
  askQuestion,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  uploadDocument,
);
router.post("/ask", authMiddleware, askQuestion);
router.get("/documents", authMiddleware, getAllDocuments);
router.get("/document/:id", authMiddleware, getDocumentById);
router.delete("/document/:id", authMiddleware, deleteDocument);
module.exports = router;
