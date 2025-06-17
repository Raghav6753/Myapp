import { Router } from "express";
import { login,signup,logout,CreateOrder,verifyPayment } from "../Controllers/user.controller.js";
const router=Router();
router.post("/login",login);
router.post("/signup",signup);
router.post("/logout",logout)
router.post("/create-order",CreateOrder);
router.post("/verify-payment", verifyPayment);
export default router;