import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node.js File system for reading files

// Configuration
cloudinary.config({
  cloud_name: "dhetjxkwj",
  api_key: "521327538282514",
  api_secret: "h5WF8pD-LcXBDRpgPmGVPeCrzFE",
  // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // api_key: process.env.CLOUDINARY_API_KEY,
  // api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("uploadOnCloudinary ~ localFilePath in cl->", localFilePath);
    if (!localFilePath) return null;
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      //   folder: "folder_name",
      resource_type: "auto",
    });
    console.log("uploadOnCloudinary ~ response->", response);
    return response;
  } catch (error) {
    console.error(error);
    // remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
