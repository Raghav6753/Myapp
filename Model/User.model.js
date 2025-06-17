import mongoose from "mongoose";
const UserSchema= new mongoose.Schema({
    "Name":{type:String,required:true},
    "Email":{type:String,required:true,unique:true},
    "Password":{type:String,required:true},
    "isVerified":{type:Boolean,default:false},
    "verifyToken":{type:String}
})
export const User=mongoose.model("User",UserSchema);
const TypeSchema=new mongoose.Schema({
    "Email":{type:String,required:true},
    "Type":{type:String,required:true},
    "Class":{type:String,required:true},
})
export const UserType=mongoose.model("type",TypeSchema);


