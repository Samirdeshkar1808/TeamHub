import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrganizationMemberSchema = new Schema(
  {
    organization_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    user_Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Member'],
      default: 'Member',
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

OrganizationMemberSchema.index(
  { organization_Id: 1, user_Id: 1 },
  { unique: true }
);

export default mongoose.model('OrganizationMember',OrganizationMemberSchema);
