import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../constants.js";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async localFilePath => {
    try{
        if(!localFilePath) throw new Error("ERROR: File path was not provided!");
        // uploads the file from our server to cloudinary
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // after the file is sucessfully uploaded
        console.log("SUCESS: uploaded file on Cloudinary at:", res.url);
        return res;
    }
    catch(err){
        console.error("ERROR: could not upload file to cloudinary:", err);
        fs.unlinkSync(localFilePath); // removes the file from our server
        console.log(`INFO: removed the temporary file at "${localFilePath}" from server`);
        return null;
    }
}