/**
 * User repository – MongoDB implementation.
 * To switch to AWS: set DB_ADAPTER=aws and implement userRepository.aws.js
 */
const User = require("../models/User");

async function createUser(data) {
  const user = new User(data);
  const saved = await user.save();
  const out = saved.toObject();
  delete out.password;
  return out;
}

async function findByEmailAndType(email, type) {
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    type,
  }).lean();
  return user ? omitPassword(user) : null;
}

/** For signin: returns users with password so we can verify. Use only in auth flow. */
async function findByEmailForAuth(email) {
  const users = await User.find({ email: email.trim().toLowerCase() })
    .select("+password")
    .lean();
  return users;
}

async function findById(id) {
  const user = await User.findById(id).lean();
  return user ? omitPassword(user) : null;
}

async function findByIdForAuth(id) {
  const user = await User.findById(id).select("+password").lean();
  return user;
}

async function updateById(id, update) {
  const updated = await User.findByIdAndUpdate(id, update, { new: true }).lean();
  return updated ? omitPassword(updated) : null;
}

function omitPassword(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  delete out.password;
  return out;
}

module.exports = {
  createUser,
  findByEmailAndType,
  findByEmailForAuth,
  findById,
   findByIdForAuth,
   updateById,
};
