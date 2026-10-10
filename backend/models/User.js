import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
    name : {
        type : String,
        required : true,
        maxlength : 50,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength : 100,
    },
    password : {
        type : String,
        required : true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  }
  ,{ timestamps : true }
);

const User = mongoose.model("User" , UserSchema);

export default User;
