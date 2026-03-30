async function create() {
  throw new Error("Message repository: AWS adapter not implemented.");
}
async function listByConversationId() {
  return [];
}

module.exports = { create, listByConversationId };
