/**
 * Data access layer. Switch DB via env.DB_ADAPTER: "mongodb" | "aws"
 */
const { env } = require("../config/env");

const adapter = env.DB_ADAPTER === "aws" ? "aws" : "mongodb";
const userRepo = require(`./userRepository.${adapter}.js`);
const requirementRepo = require(`./requirementRepository.${adapter}.js`);
const availabilityWindowRepo = require(`./availabilityWindowRepository.${adapter}.js`);
const scheduledSessionRepo = require(`./scheduledSessionRepository.${adapter}.js`);
const proposalRepo = require(`./proposalRepository.${adapter}.js`);
const conversationRepo = require(`./conversationRepository.${adapter}.js`);
const messageRepo = require(`./messageRepository.${adapter}.js`);

module.exports = {
  userRepository: userRepo,
  requirementRepository: requirementRepo,
  availabilityWindowRepository: availabilityWindowRepo,
  scheduledSessionRepository: scheduledSessionRepo,
  proposalRepository: proposalRepo,
  conversationRepository: conversationRepo,
  messageRepository: messageRepo,
};
