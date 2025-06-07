import { User } from "../Model/User.model.js";
import jwt from "jsonwebtoken"
const CreateToken=(userId,res)=>{
    const Token=jwt.sign({userId},process.env.JWT_TOKEN,{
        expiresIn:"2d"
    })
res.cookie("jwt", Token, {
  httpOnly: true,
  secure: true,         // true in production (HTTPS)
  sameSite: "Strict",   // or "Lax" or "None"
  maxAge: 3600000       // 1 hour in ms
});

}
export default CreateToken;
