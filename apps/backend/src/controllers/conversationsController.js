const { USER_TYPES } = require("../config/constants");
const {
  conversationRepository,
  messageRepository,
  userRepository,
} = require("../repositories");

function getOtherParticipant(conversation, userId) {
  const uid = String(userId);
  if (String(conversation.businessUserId?._id || conversation.businessUserId) === uid) {
    const expert = conversation.expertUserId;
    const name = expert?.name || [expert?.firstName, expert?.lastName].filter(Boolean).join(" ") || expert?.email || "Expert";
    return { id: expert?._id || expert, name, role: "Expert", email: expert?.email };
  }
  const business = conversation.businessUserId;
  const name = business?.companyName || business?.contactName || business?.email || "Business";
  return { id: business?._id || business, name, role: "Business", email: business?.email };
}

function serializeConversation(conv, userId) {
  const other = getOtherParticipant(conv, userId);
  return {
    id: conv._id != null ? conv._id.toString() : conv._id,
    businessUserId: conv.businessUserId?._id != null ? conv.businessUserId._id.toString() : conv.businessUserId,
    expertUserId: conv.expertUserId?._id != null ? conv.expertUserId._id.toString() : conv.expertUserId,
    requirementId: conv.requirementId?._id != null ? conv.requirementId._id.toString() : (conv.requirementId || null),
    requirementTitle: conv.requirementId?.formData?.selectedOutcome || null,
    otherParticipant: other,
    updatedAt: conv.updatedAt,
    createdAt: conv.createdAt,
  };
}

/**
 * GET /api/conversations
 * List conversations for the current user (business or expert).
 */
async function listConversations(req, res) {
  try {
    const userId = req.user.userId;
    const type = req.user.type;

    const list =
      type === USER_TYPES.BUSINESS
        ? await conversationRepository.listByBusinessUser(userId)
        : await conversationRepository.listByExpertUser(userId);

    const serialized = list.map((c) => serializeConversation(c, userId));
    return res.json({ success: true, conversations: serialized });
  } catch (err) {
    console.error("listConversations:", err);
    return res.status(500).json({ success: false, error: "Failed to load conversations." });
  }
}

/**
 * POST /api/conversations
 * Create or get existing conversation.
 * Business body: { expertId, requirementId?, proposalId? }
 * Expert body: { businessId, requirementId?, proposalId? }
 */
async function createOrGetConversation(req, res) {
  try {
    const userId = req.user.userId;
    const type = req.user.type;
    const { expertId, businessId, requirementId, proposalId } = req.body;

    let businessUserId, expertUserId;
    if (type === USER_TYPES.BUSINESS) {
      if (!expertId) return res.status(400).json({ success: false, error: "expertId is required." });
      businessUserId = userId;
      expertUserId = expertId;
    } else {
      if (!businessId) return res.status(400).json({ success: false, error: "businessId is required." });
      businessUserId = businessId;
      expertUserId = userId;
    }

    let conv = await conversationRepository.findByBusinessAndExpertAndRequirement(
      businessUserId,
      expertUserId,
      requirementId || null
    );

    if (!conv) {
      conv = await conversationRepository.create({
        businessUserId,
        expertUserId,
        requirementId: requirementId || null,
        proposalId: proposalId || null,
      });
    }

    const populated = await conversationRepository.findById(conv._id.toString());
    const serialized = serializeConversation(populated || conv, userId);
    return res.status(200).json({ success: true, conversation: serialized });
  } catch (err) {
    console.error("createOrGetConversation:", err);
    return res.status(500).json({ success: false, error: "Failed to create or get conversation." });
  }
}

/**
 * GET /api/conversations/:id
 * Get one conversation (must be a participant).
 */
async function getConversation(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const conv = await conversationRepository.findById(id);
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found." });

    const bid = String(conv.businessUserId?._id || conv.businessUserId);
    const eid = String(conv.expertUserId?._id || conv.expertUserId);
    if (bid !== String(userId) && eid !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to view this conversation." });
    }

    const serialized = serializeConversation(conv, userId);
    return res.json({ success: true, conversation: serialized });
  } catch (err) {
    console.error("getConversation:", err);
    return res.status(500).json({ success: false, error: "Failed to load conversation." });
  }
}

/**
 * GET /api/conversations/:id/messages
 * List messages in a conversation.
 */
async function listMessages(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    const conv = await conversationRepository.findById(id);
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found." });

    const bid = String(conv.businessUserId?._id || conv.businessUserId);
    const eid = String(conv.expertUserId?._id || conv.expertUserId);
    if (bid !== String(userId) && eid !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to view this conversation." });
    }

    const list = await messageRepository.listByConversationId(id, { limit, skip });
    const messages = list.map((m) => ({
      id: m._id != null ? m._id.toString() : m._id,
      conversationId: m.conversationId != null ? m.conversationId.toString() : m.conversationId,
      senderId: m.senderId != null ? m.senderId.toString() : m.senderId,
      senderType: m.senderType,
      content: m.content,
      createdAt: m.createdAt,
    }));

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("listMessages:", err);
    return res.status(500).json({ success: false, error: "Failed to load messages." });
  }
}

/**
 * POST /api/conversations/:id/messages
 * Send a message. Body: { content }
 */
async function sendMessage(req, res) {
  try {
    const userId = req.user.userId;
    const type = req.user.type;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, error: "content is required." });
    }

    const conv = await conversationRepository.findById(id);
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found." });

    const bid = String(conv.businessUserId?._id || conv.businessUserId);
    const eid = String(conv.expertUserId?._id || conv.expertUserId);
    if (bid !== String(userId) && eid !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to send messages in this conversation." });
    }

    const senderType = type === USER_TYPES.BUSINESS ? "business" : "expert";
    const msg = await messageRepository.create({
      conversationId: id,
      senderId: userId,
      senderType,
      content: content.trim(),
    });
    await conversationRepository.updateUpdatedAt(id);

    return res.status(201).json({
      success: true,
      message: {
        id: msg._id != null ? msg._id.toString() : msg._id,
        conversationId: msg.conversationId != null ? msg.conversationId.toString() : msg.conversationId,
        senderId: msg.senderId != null ? msg.senderId.toString() : msg.senderId,
        senderType: msg.senderType,
        content: msg.content,
        createdAt: msg.createdAt,
      },
    });
  } catch (err) {
    console.error("sendMessage:", err);
    return res.status(500).json({ success: false, error: "Failed to send message." });
  }
}

module.exports = {
  listConversations,
  createOrGetConversation,
  getConversation,
  listMessages,
  sendMessage,
};
