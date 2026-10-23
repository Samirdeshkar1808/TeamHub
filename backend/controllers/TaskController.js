import mongoose from "mongoose";
import Task from "../models/Task.js";

import OrganizationMembership from "../models/OrganizationMembership.js";
import Team from "../models/Team.js";
import Teammember from "../models/TeamMembership.js";

const getAccess = async (team , userId) =>{

    try{

        const teammembership = await Teammember.findOne({team_Id:team._id , user_Id : userId}).lean();
        const organizationMembership = await OrganizationMembership.findOne({organization_Id: team.organization_Id , user_Id : userId}).lean();
        
        const isOrgAdmin = organizationMembership && ['Owner', 'Admin'].includes(organizationMembership.role);

        return { 
            organizationMembership,
            teammembership,
            isOrgAdmin: Boolean(isOrgAdmin),
            isMember: Boolean(teammembership),
            canManage: Boolean(isOrgAdmin || teammembership?.role === 'Head'),
            canAccess: Boolean(isOrgAdmin || teammembership),
        };
    }
    catch(err){
        console.log(err);
        return null;
    }

}

//Post  /teams/:teamId/tasks
export const createTask = async (req , res) =>{

  try{

    const {teamId} = req.params;
    const {title , description='' , assigneduserId , priority='Medium', dueDate = null} = req.body;
    const userId = req.user._id;
    console.log(title , assigneduserId);
    if(!title || !assigneduserId){
        return res.status(400).json({
            message : "Title is required and assigned to a member"
        });
    }

    if(title.trim().length > 100 || description.trim().length > 300){
        return res.status(400).json({
            message : "Title Maxlength should be 100 and description Maxlength should be 300."
        });
    }

    if (!['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const team = await Team.findById(teamId);

    if(!team){
        return res.status(400).json({
            message : "Team Not Found",
        });
    }

    const access = await getAccess(team, req.user._id);

    if(!access.canManage) {
      return res.status(403).json({
        message: 'Only the Team Head or organization Owner/Admin can create tasks',
      });
    }

    const existedTask = await Task.findOne({team_Id : teamId , title : title.trim()});

    if(existedTask){
        return res.status(400).json({
            message : "Title already Exists."
        })
    }
    const targetUser = await Teammember.findOne({team_Id : team._id ,user_Id : assigneduserId});

    if(!targetUser){
        return res.status(400).json({
            message : "Asssigned User Not Found or Not a Team Member."
        });
    }

    //if a user is team member then user is automatically a Organization member (already checked while joing team member.)

    const task = await Task.create({
        organization_Id : team.organization_Id,
        team_Id : team._id,
        title : title.trim(),
        description : description.trim(),
        created_By : userId,
        assigned_To : assigneduserId,
        priority : priority,
        dueDate: dueDate === null ? null : new Date(dueDate),
    });

    return res.status(200).json({
        message: "Task Created Successfully.",
        task 
    });

  }
  catch(err){
    console.log(err);
    return res.status(500).json({
        message : "Task not Created."
    });
  }

};

// Get   /teams/:teamId/tasks

export const getTasks = async(req,res) =>{

    try{

        const {teamId} = req.params;
        const userId = req.user._id;

        const team = await Team.findById(teamId);
        
        if(!team){ 
            return res.status(404).json({ message: 'Team not found' });
        }

        const access = await getAccess(team, userId);

        if (!access.canAccess) {
            return res.status(403).json({
              message: 'You do not have access to this team',
            });
        }

        const tasks = await Task.find({team_Id : teamId}).populate('created_By', 'name email').populate('assigned_To', 'name email')
                            .sort({dueDate: 1,createdAt: -1}).lean();

        return res.status(200).json({count: tasks.length, tasks});
    }
    catch(err){
        console.error(err);
        return res.status(500).json({message:'Failed to fetch tasks' });
    }
}

// GET       /tasks/:taskId

export const getTaskById = async(req, res)=>{
  try{
    const {taskId} = req.params;

    const task = await Task.findById(taskId).populate('created_By', 'name email').populate('assigned_To', 'name email').lean();

    if(!task){
      return res.status(404).json({ message: 'Task not found' });
    }

    const team = await Team.findById(task.team_Id);

    if(!team){
      return res.status(404).json({message:'Task team not found' });
    }

    const access = await getAccess(team, req.user._id);

    if(!access.canAccess) {
      return res.status(403).json({
        message: 'You do not have access to this task',
      });
    }

    return res.status(200).json({task});
  }catch(err) {
    console.error(err);
    return res.status(500).json({message:'Failed to fetch task'});
  }
};


// PATCH   /tasks/:taskId

export const updateTask = async(req, res)=>{
  try{
    const {taskId} = req.params;

    const allowedFields = ['title','description','priority','dueDate','assigned_To'];
    const suppliedFields = Object.keys(req.body);

    if(suppliedFields.length === 0 || suppliedFields.some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({
        message: 'Only title, description, priority, dueDate and assigned_To can be updated',
      });
    }

    const task = await Task.findById(taskId);

    if(!task){
      return res.status(404).json({message:'Task not found' });
    }

    const team = await Team.findById(task.team_Id);

    if(!team){return res.status(404).json({ message: 'Task team not found' }); }

    const access = await getAccess(team, req.user._id);

    if (!access.canManage){
      return res.status(403).json({
        message: 'Only the Team Head or organization Owner/Admin can edit task details',
      });
    }

    const updates = {};
    
    if(req.body.title !== undefined){
      if(typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 100){
        return res.status(400).json({message:'Invalid task title'});
      }
      updates.title = req.body.title.trim();
    }

    if(req.body.description !== undefined){
      if( typeof req.body.description !== 'string' || req.body.description.length > 300){
          return res.status(400).json({ message: 'Invalid description' });
        }
      updates.description = req.body.description.trim();
    }

    if(req.body.priority !== undefined){
      if(!['Low','Medium','High','Urgent'].includes(req.body.priority)) {
        return res.status(400).json({message:'Invalid priority'});
      }
      updates.priority = req.body.priority;
    }

    if(req.body.dueDate !== undefined){
      if(req.body.dueDate !== null && (typeof req.body.dueDate !== 'string' || req.body.dueDate.trim() === '' || Number.isNaN(Date.parse(req.body.dueDate))) ){
        return res.status(400).json({ message: 'Invalid due date' });
      }
      updates.dueDate = req.body.dueDate === null ? null : new Date(req.body.dueDate);
    }

    if(req.body.assigned_To !== undefined) {
      const result = await Teammember.findById(req.body.assigned_To);

      if(!result){ 
        return res.status(400).json({message: "Assigned User Not Found"}); 
      }

      updates.assigned_To = req.body.assigned_To;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId,{$set: updates},{runValidators: true});

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });

  }catch (err){
    console.error(err);
    return res.status(500).json({message:'Failed to update task' });
  }
};


// Patch   /tasks/:taskId/status
 //assignee can update their own task's status.

export const updateTaskStatus = async(req, res)=>{
  try{
    const {taskId} = req.params;
    const {status} = req.body;

    if (!['Todo', 'InProgress', 'Cancelled', 'Done'].includes(status)) {
      return res.status(400).json({ message:'Invalid task status' });
    }

    const task = await Task.findById(taskId);

    if(!task){
      return res.status(404).json({ message:'Task not found' });
    }

    const team = await Team.findById(task.team_Id);
    if(!team) {
      return res.status(404).json({message:'Team not found' });
    }

    const access = await getAccess(team,req.user._id);
    const isAssignedUser = task.assigned_To === req.user._id ? true : false;

    if(!access.canManage && !isAssignedUser) {
      return res.status(403).json({
        message: 'Only an assignee, Team Head or organization Owner/Admin can update task status',
      });
    }

    task.status = status;
    task.completedAt = status === 'Done'? new Date(): null;

    await task.save();

    return res.status(200).json({
      message: 'Task status updated successfully',
      task,
    });
  }catch(err) {
    console.error(err);
    return res.status(500).json({message:'Failed to update task status'});
  }
};

//  DELETE   /tasks/:taskId

export const deleteTask = async(req, res)=>{
  try{
    const {taskId} = req.params;

    const task = await Task.findById(taskId);
    if(!task) {
      return res.status(404).json({message:'Task not found' });
    }

    const team = await Team.findById(task.team_Id);
    if(!team) {
      return res.status(404).json({message:'Task team not found' });
    }

    const access = await getAccess(team, req.user._id);
    if(!access.canManage){
      return res.status(403).json({
        message: 'Only the Team Head or organization Owner/Admin can delete tasks',
      });
    }

    await task.deleteOne();

    return res.status(200).json({message:'Task deleted successfully'});

  }catch(err){
    console.error(err);
    return res.status(500).json({message:'Failed to delete task'});
  }
};






