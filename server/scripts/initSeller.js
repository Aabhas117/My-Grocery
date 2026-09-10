import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../configs/db.js";

async function initSeller() {
  try {
    const email = process.env.SELLER_INIT_EMAIL;
    const password = process.env.SELLER_INIT_PASSWORD;

    if (!email) {
      console.error("❌ Error: SELLER_INIT_EMAIL environment variable is required.");
      process.exit(1);
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "seller") {
        console.log(`✓ Account (${email}) is already configured with role: "seller". No changes needed.`);
      } else {
        existingUser.role = "seller";
        await existingUser.save();
        console.log(`✓ Existing user (${email}) updated to role: "seller". Password hash preserved.`);
      }
    } else {
      if (!password) {
        console.error("❌ Error: SELLER_INIT_PASSWORD is required to create a new seller account.");
        await mongoose.disconnect();
        process.exit(1);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name: "Seller",
        email,
        password: hashedPassword,
        role: "seller",
      });

      console.log(`✓ New seller account created for (${email}) with role: "seller".`);
    }

    await mongoose.disconnect();
    console.log("✓ Seller initialization completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize seller account:", error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

initSeller();
