import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authSeller = async (req, res, next) => {
  try {
    const { sellerToken, token } = req.cookies;
    const activeToken = sellerToken || token;

    if (!activeToken) {
      return res.json({
        success: false,
        message: "Not Authorized",
      });
    }

    const decoded = jwt.verify(activeToken, process.env.JWT_SECRET);

    // Verify role-based seller authorization
    if (decoded.id) {
      const user = await User.findById(decoded.id);
      if (user && user.role === "seller") {
        return next();
      }
    } else if (decoded.isSeller) {
      return next();
    }

    return res.json({
      success: false,
      message: "Not Authorized",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authSeller;
