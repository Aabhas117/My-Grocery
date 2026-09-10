import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

//seller login : /api/seller/login

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check hardcoded env credentials fallback if configured
    const isEnvSeller =
      process.env.SELLER_EMAIL &&
      process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL &&
      password === process.env.SELLER_PASSWORD;

    if (isEnvSeller) {
      const token = jwt.sign(
        { email, isSeller: true },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ success: true, message: "Logged In" });
    }

    // Authenticate user against MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Check if user has seller role or matches SELLER_EMAIL
    const isAuthorizedSeller =
      user.role === "seller" ||
      (process.env.SELLER_EMAIL && user.email === process.env.SELLER_EMAIL);

    if (!isAuthorizedSeller) {
      return res.json({
        success: false,
        message: "User is not authorized as a seller",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isSeller: true },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged In" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//seller isAuth : /api/seller/is-auth

export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//seller logout : /api/seller/logout

export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
