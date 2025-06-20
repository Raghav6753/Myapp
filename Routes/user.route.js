import { Router } from "express";
import { login,signup,logout,CreateOrder,verifyPayment, verifyEmail, SendOtp,DeleteUser } from "../Controllers/user.controller.js";
const router=Router();
router.post("/login",login);
router.post("/signup",signup);
router.post("/logout",logout)
router.post("/create-order",CreateOrder);
router.post("/verify-payment", verifyPayment);
router.get("/verify/:token",verifyEmail);
router.post("/send-otp",SendOtp);
router.post("/delete",DeleteUser)
export default router;