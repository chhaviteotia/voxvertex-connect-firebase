const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { createApp } = require("./src/app");

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

let appPromise = null;
function getApp() {
  if (!appPromise) appPromise = createApp();
  return appPromise;
}

exports.api = onRequest(async (req, res) => {
  const app = await getApp();
  return app(req, res);
});
