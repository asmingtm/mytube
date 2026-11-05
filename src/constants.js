export const PORT = process.env.PORT || 8000;
export const DB_NAME = "practice";
export const FULL_MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;
export const DEFAULT_LIMIT = "16kb";
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;