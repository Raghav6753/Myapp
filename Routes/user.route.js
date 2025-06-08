import { Router } from "express";
import { login,signup,logout,CreateOrder } from "../Controllers/user.controller.js";
const router=Router();
router.post("/login",login);
router.post("/signup",signup);
router.post("/logout",logout)
router.post("/create-order",CreateOrder);
export default router;