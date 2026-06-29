const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["private", "group"],
            default: "private",
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        groupName: {
            type: String,
            trim: true,
            default: "",
        },

        groupAvatar: {
            type: String,
            default: "",
        },

        groupDescription: {
            type: String,
            trim: true,
            default: "",
        },

        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;