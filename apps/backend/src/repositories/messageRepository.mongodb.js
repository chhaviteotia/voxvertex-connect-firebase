const mongoose = require("mongoose");
const Message = require("../models/Message");

function toObjectId(id) {
  if (id == null) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

async function create(data) {
  const doc = new Message({
    conversationId: toObjectId(data.conversationId),
    senderId: toObjectId(data.senderId),
    senderType: data.senderType,
    content: data.content,
  });
  const saved = await doc.save();
  return saved.toObject();
}

async function listByConversationId(conversationId, options = {}) {
  const { limit = 100, skip = 0 } = options;
  const list = await Message.find({ conversationId: toObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return list;
}

module.exports = {
  create,
  listByConversationId,
};
