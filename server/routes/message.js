const express = require("express");
const {
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage,
} = require('../controllers/message.js');
const protect = require('../middlewars/auth.js');

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);
router.put("/:id", protect, editMessage);
router.delete("/:id", protect, deleteMessage);

module.exports = router;