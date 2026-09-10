import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  sellerLogout,
  sellerRegister,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/register", sellerRegister);
sellerRouter.post("/login", sellerLogin);
sellerRouter.post("/is-auth", authSeller, isSellerAuth);
sellerRouter.post("/logout", sellerLogout);

export default sellerRouter;
