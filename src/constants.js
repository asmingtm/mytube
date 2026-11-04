export const PORT = process.env.PORT || 8000;
export const DB_NAME = "practice";
export const FULL_MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;
export const DEFAULT_LIMIT = "16kb";