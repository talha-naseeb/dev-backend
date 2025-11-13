const cloudinary = require("../config/cloudinary");

exports.uploadToCloudinary = (fileBuffer, folder = "profile_images") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};
