const express = require("express");
const {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
} = require('../controllers/conversation.js');

const protect = require('../middlewars/auth.js');

const router = express.Router();

router.post("/", protect, createConversation);
router.get("/", protect, getConversations);
router.get("/:id", protect, getConversation);
router.put("/:id", protect, updateConversation);
router.delete("/:id", protect, deleteConversation);

module.exports = router;