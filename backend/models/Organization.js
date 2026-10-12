import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrganizationSchema = new Schema({

    name : {
        type : String,
        required : true,
        maxlength : 50,
    },
    description:{
        type : String,
        maxlength : 200,
        default: '',
    },
    created_By : {
        type : Schema.Types.ObjectId,
        ref:"User",
        required : true
    },
}, {timestamps:true});

const Organization = mongoose.model("Organization" , OrganizationSchema);

export default Organization;