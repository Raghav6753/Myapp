import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./Routes/user.route.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:4001"
}));

const Port = process.env.PORT || 4000;

// ✅ Correct usage of router
app.use("/api/user", router);

// ✅ Optional: add a GET handler directly
app.get("/api/user", (req, res) => {
  return res.json({ message: "User GET works!" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MONGO DB");
  })
  .catch(error => {
    console.log("Error in Connecting to MONGODB: " + error);
  });

app.listen(Port, () => {
  console.log(`Server is running on Port ${Port}`, Port);
});
