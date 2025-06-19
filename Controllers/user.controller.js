import { User, UserType } from "../Model/User.model.js"
import bcrypt from "bcryptjs"
import CreateToken from "../jwt/CreateToken.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto"
dotenv.config();
// 📁 In your controller (e.g., userController.js or wherever you want)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  },
});
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
  // if (!ExistingUser.isVerified) {
  //   const token = crypto.randomBytes(32).toString("hex");
  //   const mailOptions = {
  //     from: process.env.EMAIL,
  //     to: Email,
  //     subject: "Verify your email - SigmaJEE",
  //     html: `<p>Click the link to verify your email:</p>
  //            <a href="https://sigmajee.netlify.app/verify-email?token=${token}">Verify Email</a>`
  //   }
  //   await transporter.sendMail(mailOptions);
  //  return res.status(400).json({message:"Verify Your Email First"});
  // }
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
  const token = crypto.randomBytes(32).toString("hex");
  const hashedPass = await bcrypt.hash(Password, 12);
  const NewUser = new User({
    Name,
    Email,
    Password: hashedPass,
    isVerified:false,
    verifyToken: token
  });

  await NewUser.save();

  const NewUserType = new UserType({
    Email,
    Type,
    Class,
  });

  await NewUserType.save();
  const mailOptions = {
    from: process.env.EMAIL,
    to: Email,
    subject: "Verify your email - SigmaJEE",
    html: `<p>Click the link to verify your email:</p>
             <a href="https://sigmajee.netlify.app/verify-email?token=${token}">Verify Email</a>`
  }
  await transporter.sendMail(mailOptions);
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
export const verifyEmail = async (req, res) => {
  const { token } = req.params; // or req.query — depends on your route

  try {
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
};
export const SendOtp = (req, res) => {
  const { user } = req.body;
  const Email = user.Email;

  const otp = Math.floor(100000 + Math.random() * 900000);

  const mailOptions = {
    from: process.env.EMAIL,
    to: Email,
    subject: "Otp For Verification",
    html: `
      <p>Here is the OTP for Sigma JEE verification. If you want to continue with the payment, use this OTP and do not share it with anyone.</p>
      <h2>${otp}</h2>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending mail:", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
    console.log("Email sent:", info.response);
    return res.status(200).json({ otp });
  });
};
export const DeleteUser=async (req,res)=>{
  const {user}=req.body;
 await User.deleteOne({ Email: user.Email });
  return res.status(200).json({message:"User Deleted Successfully"});
}