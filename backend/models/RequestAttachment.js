import mongoose from "mongoose";
import { Schema } from "mongoose";

const RequestAttachmentSchema = new Schema(
  {
    organization_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    request_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },

    uploaded_By: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      maxlength: 255,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
      maxlength: 100,
    },

    sizeInBytes: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model('RequestAttachment',RequestAttachmentSchema);
