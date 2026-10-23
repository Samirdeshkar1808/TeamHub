import mongoose from 'mongoose';

import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Teammember from '../models/TeamMembership.js';
import OrganizationMembership from '../models/OrganizationMembership.js';
import Organization from '../models/Organization.js';
import Request from '../models/Request.js';

// GET   /dashboard/summary
export const getDashboard = async (req, res) => {
  try{
    const userId = req.user._id;
    
    const teamMemberships = await Teammember.find({user_Id: userId}).select('team_Id role description').lean();
    const teamIds = teamMemberships.map((membership) => membership.team_Id);


    const organizationMemberships = await OrganizationMembership.find({user_Id: userId}).select('organization_Id role description').lean();
    const organizationIds = organizationMemberships.map((membership) => membership.organization_Id);

    // Tasks assigned to the current user.
    const assignedTaskFilter = {assigned_To: userId};
    const now = new Date();

    const [assignedTasks,overdueTasks,myRequests] = 
      await Promise.all([Task.countDocuments({...assignedTaskFilter ,status:{$in : ['Todo','InProgress']}}),
                         Task.countDocuments({...assignedTaskFilter,status:{$ne:'Done'},dueDate:{$lt: now, $ne: null }}),
                         Request.countDocuments({$or: [assignedTaskFilter,{created_By:userId}] }),
                        ]);

    return res.status(200).json({
      summary:{
        assignedTasks,
        overdueTasks,
        myTeams : teamIds.length,
        myRequests,
        myOrganizations: organizationIds.length,
        teamMemberships,
        organizationMemberships
      },
    });
  }catch(err){
    console.error('Get dashboard summary error:', err);
    return res.status(500).json({
      message: 'Failed to fetch dashboard summary',
    });
  }
};

//Get   /dashboard/my-tasks

export const getMyTasks = async (req, res) => {
  try{ 
    const userId = req.user._id;

    // Validate optional status filter.
    const allowedStatuses = ['Todo','InProgress','Cancelled','Done'];

    const {status} = req.query;

    if(status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status filter',
        allowedStatuses,
      });
    }

    // Always restrict results to tasks assigned to the logged-in user.
    const filter = { assigned_To: userId};

    const [Alltasks, completedTasks , currTasks] = await Promise.all([
      Task.find(filter).populate('team_Id', 'name').populate('organization_Id', 'name').populate('created_By', 'name email')
          .sort({ dueDate: 1, createdAt: -1 }).lean(),

      Task.countDocuments({...filter , status:'Done'}),
      Task.countDocuments({...filter , status: { $ne: 'Done'}})
     
    ]);

    const filteredTasks = status ? Alltasks.filter(task => task.status === status): [];

    return res.status(200).json({
      Allcount: Alltasks.length,
      Alltasks,
      currTasks,
      completedTasks,
      filteredTasks,
    });
  }catch(err) {
    console.error('Get my tasks error:', err);

    return res.status(500).json({
      message: 'Failed to fetch your tasks',
    });
  }
};


//Get   /dashboard/team/:teamId   
//only for team head , admin , owner

export const getTeamDashboard = async (req, res) => {
  try{
    const {teamId} = req.params;
    const userId = req.user._id;

    const team = await Team.findById(teamId).select('_id name organization_Id');

    if(!team){
      return res.status(404).json({
        message: 'Team not found',
      });
    }

    const [teamMembership, organizationMembership] =
      await Promise.all([
        Teammember.findOne({team_Id: team._id,user_Id: userId}).lean(),
        OrganizationMembership.findOne({organization_Id: team.organization_Id,user_Id: userId}).lean(),
      ]);

    const isTeamHead = teamMembership?.role === 'Head';

    const isOrganizationAdmin = Boolean(['Owner', 'Admin'].includes(organizationMembership.role)
    );

    if(!isTeamHead && !isOrganizationAdmin){
      return res.status(403).json({
        message: 'Only the Team Head or organization Owner/Admin can view this dashboard',
      });
    }

    const now = new Date();

    const [totalTasks, todoTasks, inProgressTasks, blockedTasks, completedTasks, overdueTasks, incomingPendingRequests, outgoingActiveRequests] = 
     await Promise.all([
      Task.countDocuments({ team_Id: team._id }),
      Task.countDocuments({team_Id: team._id,status: 'Todo'}),
      Task.countDocuments({team_Id: team._id,status: 'InProgress'}),
      Task.countDocuments({team_Id: team._id,status: 'Blocked'}),
      Task.countDocuments({team_Id: team._id,status: 'Done'}),
      Task.countDocuments({team_Id: team._id,status: { $ne: 'Done' },dueDate: { $lt: now, $ne: null }}),

      Request.countDocuments({to_Team: team._id,status: 'Pending'}),
      Request.countDocuments({from_Team: team._id, status: { $in: ['Pending','Clarification','Approved','InProgress']}})

    ]);

    return res.status(200).json({
      team: {id: team._id,name: team.name},
      dashboard:{
        tasks:{
          total: totalTasks,
          byStatus:{
            Todo: todoTasks,
            InProgress: inProgressTasks,
            Blocked: blockedTasks,
            Done: completedTasks,
          },
          overdue: overdueTasks,
        },
        requests:{
          incomingPending: incomingPendingRequests,
          outgoingActive: outgoingActiveRequests,
        },
      },
    });
  } catch (err) {
    console.error('Get team dashboard error:', err);

    return res.status(500).json({
      message: 'Failed to fetch team dashboard',
    });
  }
};

//Get   /dashboard/organization/:organizationId

export const getOrganizationDashboard = async(req, res) => {
  try{
    const {organizationId} = req.params;
    const userId = req.user._id;

    const organization = await Organization.findById(organizationId).select('_id name');

    if(!organization){
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    const membership = await OrganizationMembership.findOne({organization_Id: organization._id,user_Id: userId}).lean();

    if (!membership || !['Owner', 'Admin'].includes(membership.role)) {
      return res.status(403).json({
        message: 'Only the organization Owner or Admin can view this dashboard',
      });
    }

    const teams = await Team.find({organization_Id: organization._id}).select('_id name');

    const teamIds = teams.map((team) => team._id);
    const now = new Date();

    const [totalMembers,totalTasks,todoTasks,inProgressTasks,blockedTasks,completedTasks,overdueTasks,incomingPendingRequests,outgoingActiveRequests] =
     await Promise.all([
      OrganizationMembership.countDocuments({organization_Id: organization._id}),
      Task.countDocuments({team_Id: { $in: teamIds }}),
      Task.countDocuments({team_Id: { $in: teamIds },status: 'Todo'}),
      Task.countDocuments({team_Id: { $in: teamIds },status: 'InProgress'}),
      Task.countDocuments({team_Id: { $in: teamIds },status: 'Blocked'}),
      Task.countDocuments({team_Id: { $in: teamIds },status: 'Done'}),
      Task.countDocuments({team_Id: { $in: teamIds },status: { $ne: 'Done' },dueDate: { $lt: now, $ne: null }}),

      Request.countDocuments({organization_Id: organization._id,status: 'Pending'}),
      Request.countDocuments({organization_Id: organization._id,status: { $in: ['Pending','Clarification','Approved','InProgress']}}),
    ]);

    return res.status(200).json({
      organization:{
        id: organization._id,
        name: organization.name,
      },
      dashboard:{
        totalTeams: teams.length,
        totalMembers,
        tasks:{
          total: totalTasks,
          byStatus:{
            Todo: todoTasks,
            InProgress: inProgressTasks,
            Blocked: blockedTasks,
            Done: completedTasks,
          },
          overdue: overdueTasks,
        },
        requests:{
          incomingPending: incomingPendingRequests,
          outgoingActive: outgoingActiveRequests,
        },
      },
    });
  } catch (err) {
    console.error('Get organization dashboard error:', err);

    return res.status(500).json({
      message: 'Failed to fetch organization dashboard',
    });
  }
};

