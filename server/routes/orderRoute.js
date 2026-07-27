import {
  getAllOrders,
  placeOrderStripe,
} from "../controllers/orderController.js";
import express from "express";
import {
  getUserOrders,
  placeOrderCOD,
} from "../controllers/orderController.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const orderRouter = express.Router();
orderRouter.get("/test", (req, res) => {
  res.send("Order route is working");
});

orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.post("/seller", authSeller, getAllOrders);
orderRouter.post("/stripe", authUser, placeOrderStripe);

export default orderRouter;
