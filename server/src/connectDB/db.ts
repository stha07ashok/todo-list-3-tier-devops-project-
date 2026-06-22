import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

export const connectToDatabase = async (): Promise<void> => {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const options: mongoose.ConnectOptions = {};
  
  if (process.env.DB_NAME) {
    options.dbName = process.env.DB_NAME;
  }

  try {
    await mongoose.connect(uri, options);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};