import mongoose from "mongoose";
import { Schema } from "mongoose";

const TeamSchema = new Schema({

    name : {
        type: String,
        required : true,
        trim : true,
        maxlength: 50
    },
    description:{
        type: String,
        maxlength: 100
    },
    organization_Id:{
        type : Schema.Types.ObjectId,
        ref: 'Organization',
        required : true
    }
}, {timestamps:true});

const Team = mongoose.model("Team" , TeamSchema);

export default Team;