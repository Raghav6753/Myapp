import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./Routes/user.route.js";
const app=express();
dotenv.config();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:4001"
}));
app.use("/api/user",router);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connect to MONGO DB");
    
}).catch(error=>{
    console.log("Error in Connecting to MONGODB :"+error);
})
app.listen(4000,()=>{
    console.log("Server is running on Port 4000");
})

