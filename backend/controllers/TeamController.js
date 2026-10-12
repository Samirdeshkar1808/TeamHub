import mongoose from "mongoose";

import Team from '../models/Team.js';
import Teammember from "../models/TeamMembership.js";
import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";


// POST  /teams    Create a team and assign its Team Head
export const createTeam = async(req , res) =>{

    const {name , description = '', headUserId} = req.body;
    const {organizationId} = req.params;

    console.log(organizationId);

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

    if(!headUserId){
        return res.status(400).json({ message: 'Head name is required' });
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

        const headMembership = await OrganizationMembership.findOne({ organization_Id: organizationId, user_Id: headUserId});

        if (!headMembership){ 
            return res.status(400).json({
                message: 'The selected Team Head does not exist or does not belong to this organization'
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
             ],{ session }
            );

            await Teammember.create(
             [
                {
                   team_Id: team._id,
                   user_Id: headUserId,
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
               headUserId,
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
        message: 'You do not have access to this team',
      });
    }

    const members = await Teammember.find({team_Id: team._id}).populate('user_Id', 'name email').sort({ role: 1, joinedAt: 1 }).lean();

    return res.status(200).json({
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
