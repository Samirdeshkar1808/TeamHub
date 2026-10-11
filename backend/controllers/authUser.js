import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function createToken(userId){

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign({userId : userId.toString()} , process.env.JWT_SECRET , {expiresIn: process.env.JWT_EXPIRES_IN || '1d'});

}


export const signup = async(req,res) =>{

 try{

    const {name , email , password} = req.body;

    if(!name || !email || !password ||  typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string'){
        
        return res.status(400).json({
            message: "All and Correct fields are required."
        });
    }

    if(name.trim().length > 50){

        return res.status(400).json({
            message : "Name cannot exceed 50 characters"
        });
    }

    if (email.trim().length > 100) {
      return res.status(400).json({
        message: 'Email is too long'
      });
    }

    if(password < 8 || password > 72){
        return res.status(400).json({
          message: 'Password must be between 8 and 72 characters'
        });
    }

    const normalEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({email : normalEmail});

    if(existingUser){
        return res.status(400).json({
            message : "Email Already Exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password , 12);

    const newUser = await User.create({ name: name.trim(), email: normalEmail, password: hashedPassword,});

    const token = createToken(newUser._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

 }catch(err){
    console.error(err)

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
 };

};


export const login = async(req,res) =>{

 try{

    const {email , password} = req.body;

    if(!email || !password){

        return res.status(400).json({
            message:"Email and Password are required"
        });
    }

    const user = await User.findOne({email : email.trim().toLowerCase()});

    if(!user){

        return res.status(401).json({
            message:"Invalid Email or Password"
        });
    }

    const isPassCorrect = bcrypt.compare(password , user.password);

    if (!isPassCorrect) {
      return res.status(401).json({
        message: "Invalid Email or password",
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message:"Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

 }catch(err){
    console.log(err);

    return res.status(500).json({
        message:"Internal server error"
    });
 }

}