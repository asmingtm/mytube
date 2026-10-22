export const DB_NAME = "practice";
export const DB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`
export const PORT = process.env.PORT || 8000;
export const DATA_LIMIT = "16kb";