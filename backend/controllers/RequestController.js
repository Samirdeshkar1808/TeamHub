import mongoose from "mongoose";

import OrganizationMembership from "../models/OrganizationMembership.js";
import Request from "../models/Request.js";
import Team from "../models/Team.js";
import Teammember from "../models/TeamMembership.js";

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];



const getAccess = async(team , userId)=>{

    try{
        const teammembership = await Teammember.findOne({team_Id:team._id , user_Id : userId}).lean();
        const organizationMembership = await OrganizationMembership.findOne({organization_Id: team.organization_Id , user_Id : userId}).lean();
            
        const isOrgAdmin = organizationMembership && ['Owner', 'Admin'].includes(organizationMembership.role);
    
        return{ 
            isOrgAdmin: Boolean(isOrgAdmin),
            isMember: Boolean(teammembership),
            canManage: Boolean(isOrgAdmin || teammembership?.role === 'Head'),
            canView: Boolean(isOrgAdmin || teammembership),
        };
    }
    catch(err){
        console.log(err);
        return null;
    }
}

const parseDueDate = (value) => {
  if(value === undefined || value === null) {
    return {value: null};
  }

  if(typeof value !== 'string' || !value.trim() || Number.isNaN(Date.parse(value))){
    return{error:'Invalid due date'};
  }

  return {value: new Date(value)};
};


// Post   /teams/:teamId/requests

export const createRequest = async(req,res)=>{

    try{

        const {teamId} = req.params;
        const {toTeamId,title,description,priority = 'Medium',dueDate = null} = req.body;

        if(typeof title !== 'string' || !title.trim() || title.trim().length > 100){
         return res.status(400).json({ 
            message: 'Title is required and must not exceed 100 characters',
         });
        }

        if(typeof description !== 'string' || !description.trim() || description.trim().length > 300) {
          return res.status(400).json({
            message: 'Description is required and must not exceed 300 characters',
          });
        }

        if(!VALID_PRIORITIES.includes(priority)) {
           return res.status(400).json({message:'Invalid priority'});
        }

        const parsedDate = parseDueDate(dueDate);
        if(parsedDate.error) {
          return res.status(400).json({message:parsedDate.error});
        }

        if(teamId === toTeamId) {
          return res.status(400).json({
            message: 'A team cannot send a request to itself',
          });
        }

        const [sourceTeam, recipientTeam] = await Promise.all([Team.findById(teamId), Team.findById(toTeamId)]);

        if(!sourceTeam || !recipientTeam){
            return res.status(404).json({
             message: 'Source team or recipient team not found',
            });
        }

        if(sourceTeam.organization_Id.toString() !== recipientTeam.organization_Id.toString()){
         return res.status(400).json({
            message: 'Requests can only be sent between teams in the same organization',
         });
        }

        const sourceAccess = await getAccess(sourceTeam, req.user._id);

        if(!sourceAccess.canManage) {
          return res.status(403).json({
           message: 'Only the source Team Head or organization Owner/Admin can create requests',
          });
        }

        const request = await Request.create({
          organization_Id: sourceTeam.organization_Id,
          from_Team: sourceTeam._id,
          to_Team: recipientTeam._id,
          created_By: req.user._id,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: parsedDate.value,
          status: 'Pending',
        });

        return res.status(201).json({message:'Cross-team request created successfully', request });
    }
    catch (err) {
      console.error(err);
      return res.status(500).json({message: 'Failed to create request'});
    }
}

//Get   /teams/:teamId/requests

export const getRequests = async(req,res) =>{

    try{

      const {teamId} = req.params;
        
      const team = await Team.findById(teamId);
        
      if(!team){
        return res.status(400).json({
          message : "Team Not Found"
        });
      }
      const access = await getAccess(team , req.user._id);
      if(!access.canView){
        return res.status(400).json({
          message : "You do not have access to this teams requests."
        });
      }

      const filter = {$or: [{from_Team: team._id},{to_Team: team._id}] };

      if(req.query.direction === 'incoming'){
        
        filter.$or = [{ to_Team: team._id }];
        
      }else if(req.query.direction === 'outgoing'){
        filter.$or = [{ from_Team: team._id }];

      }else if(req.query.direction && !['all', 'incoming', 'outgoing'].includes(req.query.direction)){
        return res.status(400).json({
          message: 'direction must be all, incoming, or outgoing',
        });
      }

      const requests = await Request.find(filter).populate('from_Team','name').populate('to_Team', 'name').populate('created_By', 'name email')
                                       .sort({ createdAt: -1 }).lean();
       
      return res.status(200).json({
        count: requests.length, 
        requests,
      });                              

    }
    catch(err) {
    console.log(req.user);
    return res.status(500).json({
      message:'Failed to fetch requests',
    });
  }
};


//GET     /requests/:requestId

export const getRequestById = async (req, res) => {
  try{

    const {requestId} = req.params;

    const request = await Request.findById(requestId).populate('from_Team', 'name organization_Id').populate('to_Team', 'name organization_Id')
                                 .populate('created_By', 'name email').populate('decision_By', 'name email').lean();

    if(!request){
      return res.status(404).json({message:'Request not found'});
    }

    const [sourceTeam, recipientTeam] = await Promise.all([
      Team.findById(request.from_Team._id),
      Team.findById(request.to_Team._id),
    ]);

    if(!sourceTeam || !recipientTeam){
      return res.status(404).json({ message: 'Request team not found' });
    }

    const [sourceAccess, recipientAccess] = await Promise.all([
      getAccess(sourceTeam, req.user._id),
      getAccess(recipientTeam, req.user._id),
    ]);

    if(!sourceAccess.canView && !recipientAccess.canView) {
      return res.status(403).json({
        message: 'You do not have access to this request',
      });
    }

    return res.status(200).json({request});

  }catch(err){
    console.error(err);
    return res.status(500).json({
      message: 'Failed to fetch request',
    });
  }
};


// PATCH  /requests/:requestId/decision
// Recipient Team Head or organization Owner/Admin decides.

export const decideRequest = async (req, res) => {
  try{
    const {requestId} = req.params;
    const {decision, note = ''} = req.body;

    if(!['Approved', 'Rejected', 'Clarification'].includes(decision)) {
      return res.status(400).json({
        message: 'Decision must be Approved, Rejected, or Clarification',
      });
    }

    if(typeof note !== 'string' || note.length > 200) {
      return res.status(400).json({
        message: 'Decision note must be a string of at most 200 characters',
      });
    }

    const request = await Request.findById(requestId);

    if(!request) {
      return res.status(404).json({message:'Request not found'});
    }

    if (!['Pending', 'Clarification'].includes(request.status)) {
      return res.status(400).json({
        message: 'This request can no longer receive an initial decision',
      });
    }

    const recipientTeam = await Team.findById(request.to_Team);

    if(!recipientTeam){
      return res.status(404).json({message: 'Recipient team not found'});
    }

    const access = await getAccess(recipientTeam, req.user._id);
    if(!access.canManage){
      return res.status(403).json({
        message: 'Only the recipient Team Head or organization Owner/Admin can decide',
      });
    }

    request.status = decision;
    request.decision_By = req.user._id;
    request.decision_At = new Date();
    request.decision_Note = note.trim();

    await request.save();

    return res.status(200).json({
      message: `Request ${decision.toLowerCase()} successfully`,
      request,
    });
  }catch(err){
    console.error(err);
    return res.status(500).json({
      message:'Failed to process request decision',
    });
  }
};

// PATCH    /requests/:requestId/status
// Recipient Team Head or organization Owner/Admin updates progress.

export const updateRequestStatus = async(req, res)=>{
  try{
    const {requestId} = req.params;
    const {status} = req.body;

    if(!['InProgress', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be InProgress or Completed',
      });
    }

    const request = await Request.findById(requestId);
    if(!request){
      return res.status(404).json({message:'Request not found'});
    }

    const recipientTeam = await Team.findById(request.to_Team);
    if(!recipientTeam) {
      return res.status(404).json({message: 'Recipient team not found'});
    }

    const access = await getAccess(recipientTeam, req.user._id);
    if(!access.canManage){
      return res.status(403).json({
        message:'Only the recipient Team Head or organization Owner/Admin can update request progress'
      });
    }

    if(status === 'InProgress' && request.status !== 'Approved') {
      return res.status(400).json({
        message: 'Only an approved request can move to InProgress'
      });
    }

    if(status === 'Completed' && request.status !== 'InProgress') {
      return res.status(400).json({
        message: 'Only an in-progress request can be completed'
      });
    }

    request.status = status;
    request.completedAt = status === 'Completed' ? new Date() : null;

    await request.save();

    return res.status(200).json({
      message: `Request marked ${status}`,
      request,
    });
  }catch(err) {
    console.error(err);
    return res.status(500).json({message: 'Failed to update request status'});
  }
};


// PATCH   /requests/:requestId/cancel
// Source Team Head or organization Owner/Admin cancels before work begins.

export const cancelRequest = async (req, res) => {
  try{
    const {requestId} = req.params;
    const request = await Request.findById(requestId);

    if(!request) {
      return res.status(404).json({message:'Request not found'});
    }

    const sourceTeam = await Team.findById(request.from_Team);
    if(!sourceTeam){
      return res.status(404).json({ message: 'Source team not found' });
    }

    const access = await getAccess(sourceTeam, req.user._id);
    if (!access.canManage) {
      return res.status(403).json({
        message: 'Only the source Team Head or organization Owner/Admin can cancel this request',
      });
    }

    if(!['Pending', 'Clarification','Approved'].includes(request.status)){
      return res.status(400).json({
        message: 'Only requests that have not started can be cancelled',
      });
    }

    request.status = 'Cancelled';
    await request.save();

    return res.status(200).json({
      message: 'Request cancelled successfully',
      request,
    });
  }catch (err) {
    console.error(err);
    return res.status(500).json({message: 'Failed to cancel request'});
  }
};

