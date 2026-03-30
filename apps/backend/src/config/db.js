const mongoose = require("mongoose");
const { env } = require("./env");

function connectDB() {
  const adapter = String(env.DB_ADAPTER || "mongodb").toLowerCase();
  const hasCustomMongoUri =
    typeof env.MONGO_URI === "string" &&
    env.MONGO_URI.trim() !== "" &&
    env.MONGO_URI.trim() !== "mongodb://localhost:27017/voxvertex";
  const shouldUseMongo =
    adapter === "mongodb" ||
    (adapter !== "mongodb" && env.DB_FALLBACK_TO_MONGODB === true && hasCustomMongoUri);

  if (!shouldUseMongo) {
    console.log(`DB adapter "${env.DB_ADAPTER}" selected (MongoDB connection skipped).`);
    return Promise.resolve();
  }

  if (adapter !== "mongodb" && env.DB_FALLBACK_TO_MONGODB) {
    if (!hasCustomMongoUri) {
      console.log(
        `DB adapter "${env.DB_ADAPTER}" selected with MongoDB fallback enabled, but MONGO_URI is default/empty. Skipping MongoDB connection.`
      );
      return Promise.resolve();
    }
    console.log(`DB adapter "${env.DB_ADAPTER}" selected with MongoDB fallback enabled.`);
  }

  const uri = env.MONGO_URI;
  return mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected };
