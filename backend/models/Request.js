import mongoose from "mongoose";
import { Schema } from "mongoose";

const RequestSchema = new Schema(
  {
    organization_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    from_Team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },

    to_Team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },

    created_By: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assigned_To: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    reviewed_By: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'InProgress',
        'Clarification',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
      required : true,
    },

    deadline: {
      type: Date,
      default: null,
    },
    decision_By: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    decision_At: {
      type: Date,
      default: null,
    },

    decision_Note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    completedAt: {
      type: Date,
      default: null,
    },


  },
  { timestamps: true }
);

RequestSchema.index({ from_Team_Id: 1, status: 1,createdAt: -1 });
RequestSchema.index({ to_Team_Id: 1, status: 1,createdAt: -1 });

const Request = mongoose.model('Request', RequestSchema);

export default Request;