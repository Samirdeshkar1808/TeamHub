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

    from_Team_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },

    to_Team_Id: {
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
      maxlength: 3000,
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
        'Accepted',
        'Rejected',
        'In Progress',
        'Needs Info',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },

    deadline: {
      type: Date,
      default: null,
    },

    review_Note: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

RequestSchema.index({organization_Id: 1,status: 1,createdAt: -1,});
RequestSchema.index({ from_Team_Id: 1, createdAt: -1 });
RequestSchema.index({ to_Team_Id: 1, status: 1 });
RequestSchema.index({ created_By: 1 });
RequestSchema.index({ assigned_To: 1 });

export default mongoose.model('Request', RequestSchema);
