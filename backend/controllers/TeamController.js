import mongoose from "mongoose";

import Team from '../models/Team.js';
import Teammember from "../models/TeamMembership.js";
import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";
import User from "../models/User.js";


// POST  /teams    Create a team and assign its Team Head
export const createTeam = async(req , res) =>{

    const {name , description = '', headEmail} = req.body;
    const {organizationId} = req.params;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Team name is required as String' });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Team name cannot exceed 100 characters' });
    }

    if (typeof description !== 'string' || description.length > 100) {
      return res.status(400).json({
        message: 'Description must be a string of at most 100 characters',
      });
    }

    if(!headEmail || typeof headEmail !== 'string'){
        return res.status(400).json({ message: 'Head Email is required' });
    }

    const session = await mongoose.startSession();

    try{

        const organization = await Organization.findById(organizationId);

        if(!organization){
            return res.status(404).json({ message: 'Organization not found' });
        }

        const creatorMembership = await OrganizationMembership.findOne({ organization_Id: organizationId, user_Id: req.user._id});

        if(!creatorMembership || (creatorMembership.role !== 'Owner' && creatorMembership.role !== 'Admin')){
            return res.status(400).json({
               message: 'Only organization Owners and Admins can create teams',
            });
        }

        const headUser = await User.findOne({email : headEmail.toLowerCase().trim()});

        if(!headUser){
          return res.status(404).json({
            message: 'User Not Found. Please check entered Email or try again',
          });
        }

        const headMembership = await OrganizationMembership.findOne({ organization_Id: organizationId , user_Id : headUser._id});

        if (!headMembership){ 
            return res.status(400).json({
              message: 'The selected Team Head does not belong to this organization'
            });
        }

        let createdTeam;

        await session.withTransaction( async () =>{

            const [team] = await Team.create(
             [
                {
                  name: name.trim(),
                  description: description.trim(),
                  organization_Id: organizationId,
                  created_By: req.user._id,
                },
             ],{session}
            );

            await Teammember.create(
             [
                {
                   team_Id: team._id,
                   user_Id: headUser._id,
                   role: 'Head',
                }
             ],{ session }
            );

            createdTeam = team;

        });

        return res.status(200).json({
            message: 'Team created successfully',
            team: {
               _id: createdTeam._id,
               name: createdTeam.name,
               description: createdTeam.description,
               organization_Id: createdTeam.organization_Id,
               created_By: createdTeam.created_By,
               head : headUser.email,
               createdAt: createdTeam.createdAt,
            }
        });

    }
    catch (err) {
        if(err.code === 11000) {
          return res.status(409).json({
            message: 'A team with this name already exists in this organization',
          });
        }

        console.error('Create team error:', err);
        return res.status(500).json({ message: 'Failed to create team' });
    } 
    finally {
       await session.endSession();
    }

};


// GET  /teams   List teams belonging to an organization

export const getTeams = async (req,res) => {

    try{

        const { organizationId } = req.params;
        
        const organization = await Organization.findById(organizationId);

        if (!organization) {
          return res.status(404).json({ message: 'Organization not found' });
        }

        const membership = await OrganizationMembership.findOne({ organization_Id: organizationId, user_Id: req.user._id});

        if (!membership) {
           return res.status(403).json({ message: 'You are not a member of this organization'});
        }

        const teams = await Team.find({ organization_Id: organizationId}).sort({ createdAt: -1 }).lean();

        const teamIds = teams.map((team) => team._id);

        const headMemberships = await Teammember.find({ team_Id: { $in: teamIds } , role: 'Head'}).populate('user_Id', 'name email').lean();

        const headByTeam = new Map( headMemberships.map((membership) => [ membership.team_Id.toString(), membership.user_Id]));

        return res.status(200).json({
           count: teams.length,
           teams: teams.map((team) => ({ ...team, head: headByTeam.get(team._id.toString()) }) )
        
        });


    }
    catch (error) {
      console.error('Get organization teams error:', error);
      return res.status(500).json({ message: 'Failed to fetch teams' });
    }

};

// GET:  /teams/:id     View one team and its members

export const getTeamById = async (req, res) => {

  try{
    const { teamId } = req.params;

    const team = await Team.findById(teamId).lean();

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const [organizationMembership, teamMembership] = await Promise.all([
      OrganizationMembership.findOne({ organization_Id: team.organization_Id, user_Id: req.user._id}),

      Teammember.findOne({team_Id: team._id, user_Id: req.user._id})

    ]);

    if (!organizationMembership) {
      return res.status(403).json({
        message: 'You are not a member of this organization',
      });
    }

    const isOrgAdmin = ['Owner', 'Admin'].includes( organizationMembership.role );

    if (!teamMembership && !isOrgAdmin) {
      return res.status(403).json({
        message: 'You do not have access to this team. Only Team members or Admin can Access.',
      });
    }

    const members = await Teammember.find({team_Id: team._id}).populate('user_Id', 'name email').sort({ role: 1, joinedAt: 1 }).lean();

    const canManage = isOrgAdmin || teamMembership?.role == 'Head' ;

    return res.status(200).json({
      canManage,
      team,
      members: members.map((membership) => ({
        user: membership.user_Id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
    });
  } 
  catch (error) {
    console.error('Get team details error:', error);
    return res.status(500).json({ message: 'Failed to fetch team details' });
  }
};


const canManageTeam = async (team, userId) => {  //team is object
  try{

    const organizationMembership = await OrganizationMembership.findOne({organization_Id: team.organization_Id, user_Id: userId });

    if(!organizationMembership) {
      return false;
    }

    const teamMembership = await Teammember.findOne({team_Id: team._id, user_Id: userId})

    const role = organizationMembership.role;
    return ( role === 'Admin' || role === 'Owner' || teamMembership?.role === 'Head');

  }
  catch(err){
    console.log(err);
    return false;
  }
  
};

//POST

export const addTeamMember = async(req,res) =>{

  try{  
    const {teamId} = req.params;
    const {email} = req.body; 

    if(typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const team = await Team.findById(teamId);

    if(!team){
      return res.status(400).json({ message: 'Team not found' });
    }

    if( !(await canManageTeam(team, req.user._id)) ) {
      return res.status(400).json({
        message: 'You cannot manage this team',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase()}).select('_id name email');

    if(!user){
      return res.status(400).json({message: 'User Not Found'});
    }

    const organizationMember = await OrganizationMembership.findOne({organization_Id : team.organization_Id , user_Id: user._id});

    if(!organizationMember) {
      return res.status(400).json({ message: 'User is not a organization member.'});
    }

    const teammembership = await Teammember.findOne({ team_Id: team._id, user_Id: user._id});

    if(teammembership) {
      return res.status(409).json({message: 'User is already a team member'});
    }

    const newMembership = await Teammember.create({team_Id: team._id , user_Id: user._id, role: 'Member'});

    return res.status(201).json({ message: 'Team member added successfully',
      membership: {
        _id: newMembership._id,
        team_Id: team._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        role: newMembership.role,
        joinedAt: newMembership.joinedAt,
      }
    });


  }
  catch (err) {
    console.error('Add team member error:', err);
    return res.status(500).json({ message: 'Failed to add team member' });
  }

}


//DELETE

export const removeTeamMember = async (req,res) =>{
  try {
    const {teamId,userId} = req.params;
    
    const team = await Team.findById(teamId);

    if(!team){
      return res.status(404).json({message:'Team not found'});
    }

    if (!(await canManageTeam(team, req.user._id))) {
      return res.status(403).json({
        message: 'You cannot manage this team',
      });
    }

    const membership = await Teammember.findOne({team_Id: team._id, user_Id: userId});

    if(!membership) {
      return res.status(404).json({message:'Team membership not found'});
    }

    if(membership.role === 'Head') {
      return res.status(400).json({
        message: 'Team Head cannnot be removed.Transfer Head role first.',
      });
    }

    await Teammember.deleteOne({ _id: membership._id });

    return res.status(200).json({
      message: 'Team member removed successfully',
    });

  }catch(err) {
    console.error(err);
    return res.status(500).json({ message:'Failed to remove team member'});
  }
};


//Post

export const changeTeamHead = async(req, res) =>{

  const session = await mongoose.startSession();

  try {
    const {teamId} = req.params;
    const {newHeadUserId} = req.body;

    const team = await Team.findById(teamId);

    if(!team) {
      return res.status(404).json({message:'Team not found'});
    }

    const removerInfo = await OrganizationMembership.findOne({organization_Id : team.organization_Id, user_Id : req.user._id});
    
    if(!removerInfo || (removerInfo.role !== 'Admin' && removerInfo.role !== 'Owner')){
      return res.status(400).json({message: "Only Admin or Owner can Change Head."})
    };

    const newHeadOrgMembership = await OrganizationMembership.findOne({organization_Id: team.organization_Id, user_Id: newHeadUserId});

    if(!newHeadOrgMembership) {
      return res.status(400).json({message: 'new Head must be Organization Member.'});
    }

    const newHeadUser = await User.findById(newHeadUserId).select('_id name email');

    if(!newHeadUser){ 
      return res.status(400).json({message: 'New Head User not found'});
    }

    await session.withTransaction(async () => {
      // Demote the current Head
      await Teammember.updateOne({team_Id: team._id, role: 'Head'},{$set:{role: 'Member'}},{session});

      // Promote the new Head if already a member, otherwise add them.
      await Teammember.findOneAndUpdate({team_Id: team._id,user_Id: newHeadUserId},
        {
          $set:{role:'Head'},
          $setOnInsert:{
            team_Id: team._id,
            user_Id: newHeadUserId,
            joinedAt: new Date(),
          },
        },
        {
          upsert: true,
          runValidators: true,
          session,
        }
      );
    });

    return res.status(200).json({
      message: 'Team Head changed successfully',
      teamId: team._id,
      newHead: {
        _id: newHeadUser._id,
        name: newHeadUser.name,
        email: newHeadUser.email,
      },
    });
  }catch(err) {
    console.error(err);
    return res.status(500).json({message:'Failed to change Team Head'});
  }finally{
    await session.endSession();
  }
};


//Get   /teams

export const getMyTeams = async(req,res) =>{

  try{

    const Teammemberships = await Teammember.find({user_Id : req.user._id}).populate('team_Id');

    const teams = Teammemberships.filter((membership) => membership.team_Id)
                                 .map((membership) =>({
                                    id: membership.team_Id._id,
                                    name: membership.team_Id.name,
                                    description: membership.team_Id.description,
                                    role: membership.role,
                                    createdAt: membership.createdAt,
                                  }));

    return res.status(200).json({
      teams
    });
  
  }catch(err){
    return res.status(400).json({
      message : "Not Available"
    })
  }
}


