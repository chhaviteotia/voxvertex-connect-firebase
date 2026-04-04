/**
 * True when this process is a deployed Firebase / Cloud Run function (not the local emulator).
 * Used for trust proxy, production secret checks, and NODE_ENV defaults.
 */
function isFirebaseCloudRuntime() {
  const emulator = String(process.env.FUNCTIONS_EMULATOR || "").toLowerCase() === "true";
  if (emulator) return false;
  return Boolean(process.env.FUNCTION_TARGET || process.env.K_SERVICE);
}

module.exports = { isFirebaseCloudRuntime };
