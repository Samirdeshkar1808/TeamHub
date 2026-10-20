import mongoose from "mongoose";
import { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    organization_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    team_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },

    created_By: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assigned_To:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required : true,
    },
    
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      required: true,
    },

    status: {
      type: String,
      enum: ['Todo', 'InProgress', 'Done', 'Cancelled'],
      default: 'Todo',
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },


    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ team_Id: 1, status: 1, deadline: 1 });
TaskSchema.index({ assigned_To: 1, status: 1 });

const Task =  mongoose.model('Task', TaskSchema);

export default Task;
