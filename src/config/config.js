// since we do not want to import dotenv file and configure at all the positions where we are configuring 
// some file where we need env variables, we can create a config file and import it wherever needed.
import dotenv from "dotenv"; // Load environment variables from .env file

dotenv.config(); // Load environment variables

const config = {
    PORT: process.env.PORT || 8000,
    MONGODB_URI: process.env.MONGODB_URI,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}

export default config; // Export the config object