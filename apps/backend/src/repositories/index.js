/**
 * Data access layer. Switch DB via env.DB_ADAPTER: "mongodb" | "firebase" | "aws"
 * If selected adapter fails and DB_FALLBACK_TO_MONGODB=true, fallback to MongoDB repo.
 */
const { env } = require("../config/env");

const adapter = (env.DB_ADAPTER || "mongodb").toLowerCase();
const supported = new Set(["mongodb", "firebase", "aws"]);
const selectedAdapter = supported.has(adapter) ? adapter : "mongodb";

const didWarnByRepo = new Set();

function loadRepo(name, preferredAdapter) {
  if (preferredAdapter === "mongodb") {
    return require(`./${name}.mongodb.js`);
  }

  let primary;
  try {
    primary = require(`./${name}.${preferredAdapter}.js`);
  } catch (_err) {
    if (env.DB_FALLBACK_TO_MONGODB) {
      if (!didWarnByRepo.has(name)) {
        didWarnByRepo.add(name);
        console.warn(`Repo ${name}.${preferredAdapter}.js missing. Falling back to MongoDB.`);
      }
      return require(`./${name}.mongodb.js`);
    }
    throw _err;
  }

  if (!env.DB_FALLBACK_TO_MONGODB) return primary;

  const fallback = require(`./${name}.mongodb.js`);
  const wrapped = {};
  for (const key of Object.keys(primary)) {
    const fn = primary[key];
    if (typeof fn !== "function") {
      wrapped[key] = fn;
      continue;
    }
    wrapped[key] = async (...args) => {
      try {
        return await fn(...args);
      } catch (err) {
        if (!didWarnByRepo.has(`${name}:${key}`)) {
          didWarnByRepo.add(`${name}:${key}`);
          console.warn(`Adapter ${preferredAdapter} failed for ${name}.${key}. Falling back to MongoDB.`);
        }
        if (typeof fallback[key] !== "function") throw err;
        return fallback[key](...args);
      }
    };
  }
  return wrapped;
}

const userRepo = loadRepo("userRepository", selectedAdapter);
const requirementRepo = loadRepo("requirementRepository", selectedAdapter);
const availabilityWindowRepo = loadRepo("availabilityWindowRepository", selectedAdapter);
const scheduledSessionRepo = loadRepo("scheduledSessionRepository", selectedAdapter);
const proposalRepo = loadRepo("proposalRepository", selectedAdapter);
const conversationRepo = loadRepo("conversationRepository", selectedAdapter);
const messageRepo = loadRepo("messageRepository", selectedAdapter);

module.exports = {
  userRepository: userRepo,
  requirementRepository: requirementRepo,
  availabilityWindowRepository: availabilityWindowRepo,
  scheduledSessionRepository: scheduledSessionRepo,
  proposalRepository: proposalRepo,
  conversationRepository: conversationRepo,
  messageRepository: messageRepo,
};
