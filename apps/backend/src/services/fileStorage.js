const cloudinary = require("cloudinary").v2;
const { env } = require("../config/env");
const { getStorageBucket } = require("../config/firebaseAdmin");

let didWarnFallback = false;

function configureCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  return true;
}

async function uploadToFirebaseStorage({ buffer, mimetype, destination }) {
  const bucket = getStorageBucket();
  if (!bucket) {
    throw new Error("Firebase Storage is not configured.");
  }
  const object = bucket.file(destination);
  await object.save(buffer, {
    resumable: false,
    contentType: mimetype || "application/octet-stream",
    metadata: {
      cacheControl: "public,max-age=3600",
    },
  });
  await object.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(destination)}`;
  return { url, downloadUrl: url, provider: "firebase", publicId: destination };
}

async function uploadToCloudinaryRaw({ buffer, folder, originalName }) {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured.");
  }
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        use_filename: true,
        filename_override: originalName || undefined,
        unique_filename: true,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
  return {
    url: uploadResult.secure_url,
    downloadUrl: cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment",
      secure: true,
    }),
    provider: "cloudinary",
    publicId: uploadResult.public_id,
  };
}

async function uploadToCloudinaryImage({ buffer, mimetype, folder }) {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured.");
  }
  const b64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${b64}`;
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, { folder }, (err, res) => (err ? reject(err) : resolve(res)));
  });
  return { url: result.secure_url, downloadUrl: result.secure_url, provider: "cloudinary", publicId: result.public_id };
}

async function uploadImageWithFallback({ buffer, mimetype, destination, cloudinaryFolder }) {
  const provider = (env.STORAGE_PROVIDER || "cloudinary").toLowerCase();
  if (provider === "firebase") {
    try {
      return await uploadToFirebaseStorage({ buffer, mimetype, destination });
    } catch (_err) {
      if (!didWarnFallback) {
        didWarnFallback = true;
        console.warn("Firebase Storage upload failed. Falling back to Cloudinary.");
      }
      return uploadToCloudinaryImage({ buffer, mimetype, folder: cloudinaryFolder });
    }
  }
  return uploadToCloudinaryImage({ buffer, mimetype, folder: cloudinaryFolder });
}

async function uploadRawWithFallback({ buffer, mimetype, destination, cloudinaryFolder, originalName }) {
  const provider = (env.STORAGE_PROVIDER || "cloudinary").toLowerCase();
  if (provider === "firebase") {
    try {
      return await uploadToFirebaseStorage({ buffer, mimetype, destination });
    } catch (_err) {
      if (!didWarnFallback) {
        didWarnFallback = true;
        console.warn("Firebase Storage upload failed. Falling back to Cloudinary.");
      }
      return uploadToCloudinaryRaw({ buffer, folder: cloudinaryFolder, originalName });
    }
  }
  return uploadToCloudinaryRaw({ buffer, folder: cloudinaryFolder, originalName });
}

module.exports = { uploadImageWithFallback, uploadRawWithFallback };
