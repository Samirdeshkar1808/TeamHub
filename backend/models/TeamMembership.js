import mongoose from "mongoose";
import { Schema } from "mongoose";

const TeammemberSchema = new Schema({
    team_Id:{
        type : Schema.Types.ObjectId,
        ref:"Team",
        required:true,
    },
    user_Id:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    role:{
        type : String,
        enum : ["Head" , "Member"],
        required : true,
    }
},{timestamps:true});

TeammemberSchema.index(
  { team_Id: 1, user_Id: 1 },
  { unique: true }
);

const Teammember = mongoose.model("Teammember" , TeammemberSchema);

export default Teammember;