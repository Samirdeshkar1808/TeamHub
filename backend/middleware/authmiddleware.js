import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async( req, res , next) =>{

 try {

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication token required',
      });
    }

    const token = authHeader.split(' ')[1];

    if(!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');

      return res.status(500).json({
        message: 'Internal server error',
      });
    }

    const decoded = jwt.verify( token, process.env.JWT_SECRET );

    const user = await User.findById(decoded.userId).select( '_id name email' );

    if(!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    req.user = user;

    next();

 }
 catch(err){
    if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError'){
      return res.status(401).json({
        message: 'Invalid or expired token',
      });
    }

    console.error('Authentication error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
 }


}

export default authMiddleware;