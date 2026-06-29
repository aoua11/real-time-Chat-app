const Conversation = require('../models/Conversation');

/**
 * Create a new conversation
 */
export const createConversation = async (req, res) => {
  try {
    const { members, type, groupName, groupAvatar, groupDescription } =
      req.body;

    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members are required.",
      });
    }

    // Include the logged-in user
    const allMembers = [...new Set([req.user.id, ...members])];

    // Prevent duplicate private conversations
    if (type === "private") {
      const existingConversation = await Conversation.findOne({
        type: "private",
        members: { $all: allMembers, $size: 2 },
      });

      if (existingConversation) {
        return res.status(200).json({
          success: true,
          conversation: existingConversation,
        });
      }
    }

    const conversation = await Conversation.create({
      type,
      members: allMembers,
      groupName,
      groupAvatar,
      groupDescription,
      admins: type === "group" ? [req.user.id] : [],
      owner: type === "group" ? req.user.id : null,
    });

    const populatedConversation = await Conversation.findById(
      conversation._id
    )
      .populate("members", "username avatar")
      .populate("admins", "username avatar")
      .populate("owner", "username avatar");

    res.status(201).json({
      success: true,
      conversation: populatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all conversations for the logged-in user
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user.id,
      isDeleted: false,
    })
      .populate("members", "username avatar status")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username avatar",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("members", "username avatar status")
      .populate("admins", "username avatar")
      .populate("owner", "username avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username avatar",
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    if (conversation.type !== "group") {
      return res.status(400).json({
        success: false,
        message: "Only groups can be updated.",
      });
    }

    if (!conversation.admins.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update this group.",
      });
    }

    const { groupName, groupAvatar, groupDescription } = req.body;

    if (groupName) conversation.groupName = groupName;
    if (groupAvatar) conversation.groupAvatar = groupAvatar;
    if (groupDescription)
      conversation.groupDescription = groupDescription;

    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    conversation.isDeleted = true;

    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};