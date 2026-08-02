import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import dns from "dns";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhook } from "./controllers/orderController.js";
import axios from "axios";
import Product from "./models/Product.js";

import {
  startCppServer,
  waitForCppServer,
  stopCppServer,
} from "./utils/cppProcess.js";


dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();
console.log("✓ Cloudinary Connected");


// Start C++ Engine
await startCppServer();

await waitForCppServer();

// Initialize Trie
const products = await Product.find().lean();

try {
  await axios.post(
    `http://${process.env.CPP_HOST || "127.0.0.1"}:${process.env.CPP_PORT || 18080}/initialize`,
    {
      products,
    }
  );

  console.log(`✓ Trie Initialized (${products.length} products)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
} catch (error) {

  stopCppServer();

  throw error;
}

//allow multiple origin
const allowedOrigins = [
  "http://localhost:5173",
  "https://my-grocery-j4es.vercel.app",
  "https://my-grocery-j4es-movm43c4y-aabhas117s-projects.vercel.app",
  "https://my-grocery-one.vercel.app",
];

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);

//middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => res.send("API is working"));
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.listen(port, () => {
  console.log(`Express Server is running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log("\nStopping services...");

  stopCppServer();

  process.exit(0);
});

process.on("SIGTERM", () => {
  stopCppServer();

  process.exit(0);
});
