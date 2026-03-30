const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  listConversations,
  createOrGetConversation,
  getConversation,
  listMessages,
  sendMessage,
} = require("../controllers/conversationsController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listConversations);
router.post("/", createOrGetConversation);
router.get("/:id", getConversation);
router.get("/:id/messages", listMessages);
router.post("/:id/messages", sendMessage);

module.exports = router;
