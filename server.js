import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./Routes/user.route.js";
import Razorpay from "razorpay";
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "https://sigmajee.netlify.app"]
}));

app.use("/api/user", router);
app.get("/api/user", (req, res) => res.json({ message: "User GET works!" }));
app.get("/", (req, res) => res.send("API is running"));

// ✅ Connect to MongoDB and THEN start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const Port = process.env.PORT || 10000;
    app.listen(Port, () => console.log(`🚀 Server running on port ${Port}`));
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Prevent server from running if DB fails
  });
