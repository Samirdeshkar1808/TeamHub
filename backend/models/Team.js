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
        maxlength: 100,
        default: ''
    },
    organization_Id:{
        type : Schema.Types.ObjectId,
        ref: 'Organization',
        required : true
    },
    created_By: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }

}, {timestamps:true});

TeamSchema.index( { organization_Id: 1, name: 1 }, { unique: true } );

const Team = mongoose.model("Team" , TeamSchema);

export default Team;