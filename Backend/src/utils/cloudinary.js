import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      return null;
    } else {
      const response = await cloudinary.uploader.upload(localfilePath, {
        resource_type: auto,
      });
      console.log("cloudinary response", response.url);
      console.log("file is Uploading cloudinary successfully");
      
      fs.unlinkSync(localfilePath);
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localfilePath); // it will remove  locally saved temporary file as the upload
    return null;
  }
};
