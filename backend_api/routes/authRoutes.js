const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
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

// Authentication
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

// Upload (Admin & Editor)
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("Admin", "Editor"),
  upload.single("document"),
  uploadDocument,
);

// Ask Question (All Roles)
router.post(
  "/ask",
  authMiddleware,
  roleMiddleware("Admin", "Editor", "Viewer"),
  askQuestion,
);

// View Documents (All Roles)
router.get(
  "/documents",
  authMiddleware,
  roleMiddleware("Admin", "Editor", "Viewer"),
  getAllDocuments,
);

router.get(
  "/document/:id",
  authMiddleware,
  roleMiddleware("Admin", "Editor", "Viewer"),
  getDocumentById,
);

// Delete Document (Admin Only)
router.delete(
  "/document/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteDocument,
);

module.exports = router;
