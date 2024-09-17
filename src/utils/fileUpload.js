import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node.js File system for reading files
import config from '../config/config.js'; // Import your config file

// Configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      //   folder: "folder_name",
      resource_type: "auto",
    });
    console.log("uploadOnCloudinary ~ response->", response);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    return response;
  } catch (error) {
    console.error(error);
    // remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
