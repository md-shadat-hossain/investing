const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [{
      type: String,
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const supportTicketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: {
      type: String,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "account", "technical", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_reply", "resolved", "closed"],
      default: "open",
    },
    messages: [messageSchema],
    assignedTo: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.plugin(toJSON);
supportTicketSchema.plugin(paginate);

// Generate unique ticket ID before saving
supportTicketSchema.pre("save", function (next) {
  if (!this.ticketId) {
    this.ticketId = "TKT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
