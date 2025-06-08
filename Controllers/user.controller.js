import { User, UserType } from "../Model/User.model.js"
import bcrypt from "bcryptjs"
import CreateToken from "../jwt/CreateToken.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
// 📁 In your controller (e.g., userController.js or wherever you want)
import crypto from "crypto";

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = process.env.RAZORPAY_SECRET;

  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.status(200).json({ success: true, message: "Payment Verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid Signature" });
  }
};


dotenv.config(); // This MUST be called at the top if not already
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const login = async (req, res) => {
    const { Email, Password } = req.body;

    const ExistingUser = await User.findOne({ Email });
    if (!ExistingUser) {
        return res.status(404).json({ message: "User Does Not Exist" });
    }
    const RealPassword = ExistingUser.Password;
    const isValid = await bcrypt.compare(Password, RealPassword);

    if (!isValid) {
        return res.status(404).json({ message: "Enter The Correct Password" });
    }

    CreateToken(ExistingUser._id, res);

    const type = await UserType.findOne({ Email });
    return res.status(200).json({ message: "Login Successful", ExistingUser, type });
};


export const signup = async (req, res) => {
    const { Name, Email, Password, ConfirmPassword, Class, Type } = req.body;

    if (Password !== ConfirmPassword) {
        return res.status(404).json({ message: "Confirm Pass and Pass don't Match" });
    }
    const ExistingUser = await User.findOne({ Email });
    if (ExistingUser) {
        return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPass = await bcrypt.hash(Password, 12);
    const NewUser = new User({
        Name,
        Email,
        Password: hashedPass
    });

    await NewUser.save();

    const NewUserType = new UserType({
        Email,
        Type,
        Class,
    });

    await NewUserType.save();

    CreateToken(NewUser._id, res);

    return res.status(200).json({ message: "Signup Successful", NewUser, NewUserType });
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true, // only over HTTPS
      sameSite: "None" // or "Lax" based on your frontend/backend setup
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Error during logout", error: err.message });
  }
};

export const CreateOrder = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
