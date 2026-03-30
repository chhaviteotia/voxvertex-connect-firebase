const multer = require("multer");

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
});

module.exports = upload.single("photo");
