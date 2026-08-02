import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    mongoose.connection.on("connected", () => {
      console.log("✓ Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
    
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
