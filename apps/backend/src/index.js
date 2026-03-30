const { env } = require("./config/env");
const { createApp } = require("./app");

const port = env.PORT;

createApp()
  .then((app) => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
