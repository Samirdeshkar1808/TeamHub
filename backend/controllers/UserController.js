import User from "../models/User.js";

export const profile = async(req,res)=>{
   
  try{
    const userInfo = await User.findOne({email : req.user.email});

    if(!userInfo){
      return res.status(400).json({
        message : "User Not Found"
      });
    }

    return res.status(200).json({
      userInfo
    })
  }
  catch(err){
    return res.status(400).json({
      err,
      message: "Error Finding User"
    })
  }
}