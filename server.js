import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./Routes/user.route.js";
import Razorpay from "razorpay"
dotenv.config();
const app = express();

app.use(express.json());

// 🔧 Enable CORS for both local & Netlify frontend
app.use(cors({
  origin: ["http://localhost:5174", "https://sigmajee.netlify.app"]
}));
// ✅ Routes
app.use("/api/user", router);
app.get("/api/user", (req, res) => res.json({ message: "User GET works!" }));
app.get("/", (req, res) => res.send("API is running"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MONGO DB"))
  .catch(err => console.log("MongoDB Error: " + err));

// 🔧 Listen on process.env.PORT
const Port = process.env.PORT || 10000;
app.listen(Port, () => console.log(`Server running on port ${Port}`));
