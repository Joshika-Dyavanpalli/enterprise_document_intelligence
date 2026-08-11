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
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getAllUsers,
  updateUserRole,
} = require("../controllers/authController");

// Authentication
router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);

// Upload Document
// Admin + Editor only
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware("Admin", "Editor"),
  upload.single("document"),
  uploadDocument,
);

// View all documents
// Admin + Editor + Viewer
router.get(
  "/documents",
  authMiddleware,
  roleMiddleware("Admin", "Editor", "Viewer"),
  getAllDocuments,
);

// View single document
// Admin + Editor + Viewer
router.get(
  "/document/:id",
  authMiddleware,
  roleMiddleware("Admin", "Editor", "Viewer"),
  getDocumentById,
);

// Delete document
// Admin only
router.delete(
  "/document/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteDocument,
);

// User Management
// Admin only
router.get("/users", authMiddleware, roleMiddleware("Admin"), getAllUsers);

router.patch(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("Admin"),
  updateUserRole,
);

module.exports = router;
