const Conversation = require('../models/Conversation');
const Message = require('../models/Message');



export const sendMessage = async (req, res) => {
  try {
    const { conversation, text, attachments, replyTo } = req.body;

    if (!conversation) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required.",
      });
    }

    const conversationExists = await Conversation.findById(conversation);

    if (!conversationExists) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const message = await Message.create({
      conversation,
      sender: req.user.id,
      text,
      attachments,
      replyTo,
      seenBy: [req.user.id],
    });

    conversationExists.lastMessage = message._id;
    await conversationExists.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username avatar")
      .populate("replyTo");

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
      deleted: false,
    })
      .populate("sender", "username avatar")
      .populate("replyTo")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    message.text = "This message was deleted.";
    message.attachments = [];

    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};