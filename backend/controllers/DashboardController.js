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
    
    const teamMemberships = await Teammember.find({user_Id: userId}).select('team_Id role').populate('team_Id' , 'name description').lean();

    const organizationMemberships = await OrganizationMembership.find({user_Id: userId}).select('organization_Id role').populate('organization_Id' , 'name description').lean();

    // Tasks assigned to the current user.
    const now = new Date();

    const [assignedTasks,overdueTasks,myRequests] = 
      await Promise.all([Task.countDocuments({assigned_To : req.user._id ,status:{$in : ['Todo','InProgress']}}),
                         Task.countDocuments({assigned_To : req.user._id ,status:{$ne:'Done'},dueDate:{$lt: now, $ne: null }}),
                         Request.countDocuments({assigned_To : req.user._id , status:{$nin : ['Completed' , 'Cancelled' , 'Rejected']} }),
                        ]);

    return res.status(200).json({
      summary:{
        assignedTasks,
        overdueTasks,
        myTeams : teamMemberships.length,
        myRequests,
        myOrganizations: organizationMemberships.length,
        teamMemberships,
        organizationMemberships,
        user : {
          name : req.user.name,
          email : req.user.email,
        }
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

export const getOrganizationInfo = async(req, res) => {
  try{
    const {organizationId} = req.params;
    const userId = req.user._id;

    const organization = await Organization.findById(organizationId);

    if(!organization){
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    const membership = await OrganizationMembership.findOne({organization_Id: organization._id,user_Id: userId}).lean();

    if(!membership || !['Owner', 'Admin'].includes(membership.role)) {
      return res.status(403).json({
        message: 'Only the organization Owner or Admin can view this dashboard',
      });
    }

    const members = await OrganizationMembership.find({organization_Id: organization._id}).populate("user_Id" , "name email").select("user_Id role joinedAt");

    return res.status(200).json({
      organization,
      userMembership : membership,
      members,
    });
  } catch (err) {
    console.error('Get organization dashboard error:', err);

    return res.status(500).json({
      message: 'Failed to fetch organization dashboard',
    });
  }
};

