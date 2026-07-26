// import User from "../models/User.js"
// //update User Cartdata : /api/cart/update



//  export const updateCart = async(req, res)=>{
//     try {
//         const { userId, cartItems } = req.body

//         await User.findByIdAndUpdate(userId, {cartItems})
//         res.json({success: true, message:  "Cart Updated"})
//     } catch (error) {
//         console.log(error.message)
//         res.json({success: false, message: error.message})
//     }
//  }
import User from "../models/User.js";

export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems } = req.body;

    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({
      success: true,
      message: "Cart Updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};