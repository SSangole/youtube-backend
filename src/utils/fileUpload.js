import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node.js File system for reading files

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      //   folder: "folder_name",
      resource_type: "auto",
    });
    console.log("uploadOnCloudinary ~ response->", response.url);
    return response;
  } catch (error) {
    console.error(error);
    // remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
