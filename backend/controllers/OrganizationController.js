import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";


import User from '../models/User.js';
import Team from '../models/Team.js';
import TeamMembership from '../models/TeamMembership.js';

/* a transaction is a way to group multiple database operations into a single unit of work 
   so that either all operations succeed or all of them are rolled back.
*/

// POST  /organizations
export const createOrganization = async (req,res) =>{

    const {name , description = ''} = req.body;

    if (typeof name !== 'string' || !name || name.trim().length > 50){

        return res.status(400).json({
            message: 'Organization name is required (Max 50 characters)'
        });
    } 

    if ( typeof description !== 'string' || description.length > 200) {
      return res.status(400).json({
        message: 'Description must be a string of at most 200 characters',
      });
    }

    const session = await mongoose.startSession();

    try{

        let organization;

        await session.withTransaction( async () =>{

            const [newOrganization] = await Organization.create(
             [
                {
                    name : name.trim(),
                    description: description.trim(),

                    created_By : req.user._id
                }
             ], {session}
            );

            await OrganizationMembership.create(
             [ 
                {
                   user_Id: req.user._id,
                   organization_Id: newOrganization._id,
                   role: 'Owner',
                }
             ], {session}
            ); 

            organization = newOrganization;

        });

        return res.status(200).json({

            message: 'Organization created successfully',

            organization : {
                id : organization._id,
                name: organization.name,
                description: organization.description,
                role: 'Owner',
                createdAt: organization.createdAt,
            }
        });
    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            message: 'Failed to create organization'
        });

    }
    finally{
        await session.endSession();
    }

};


// GET  /organizations

export const getMyOrganizations = async(req,res) =>{

    try{

      const memberships = await OrganizationMembership.find({ user_Id: req.user._id}).populate('organization_Id').sort({ createdAt: -1 });
      //memberships will be an array

      const organizations = memberships.filter((membership) => membership.organization_Id)
                                        .map((membership) =>({
                                          id: membership.organization_Id._id,
                                          name: membership.organization_Id.name,
                                          description: membership.organization_Id.description,
                                          role: membership.role,
                                          createdAt: membership.organization_Id.createdAt,
                                          

                                        }));

        
        return res.status(200).json({ organizations });


    }
    catch(err){

        console.error('Get organizations error');

        return res.status(500).json({
            message: 'failed to fetch organizations'
        });
    }

};


// GET  /organizations/:organizationId

export const getOrganizationById = async(req , res) =>{

    try{

        const { organizationId } = req.params;

        const membership = await OrganizationMembership.findOne({organization_Id: organizationId, user_Id : req.user._id});

        if(!membership) {
           return res.status(404).json({
            message: 'Organization not found',
           });
        }

        const organization = await Organization.findById(organizationId);

        if (!organization) {
            return res.status(404).json({
               message: 'Organization not found',
            });
        }

        return res.status(200).json({
          organization: {
            id: organization._id,
            name: organization.name,
            description: organization.description,
            created_By: organization.created_By,
            role: membership.role,
            createdAt: organization.createdAt,
          } 
        });


    }
    catch (error) {
       console.error('Get organization error:', err.message);

        return res.status(500).json({
          message: 'Failed to fetch organization',
        });
    }

};

//POST  //organisations/organizationId/members

export const addOrganizationMember = async(req,res) =>{

 try{

    const {organizationId} = req.params;
    const {email , role='Member'} = req.body;

    if(!email || typeof email !== 'string'){
        return res.status(400).json({
            message : "Email and organization must be selected"
        });
    }

    if(role !== 'Admin' && role !== 'Member'){
        return res.status(400).json({message : "Role Not Available"});
    }

    const organization = await Organization.findById(organizationId);

    if(!organization){
        return res.status(400).json({
            message : "organization do not exist"
        });
    }

    const adderInfo = await OrganizationMembership.findOne({organization_Id : organizationId , user_Id : req.user._id});

    if(!adderInfo || (adderInfo.role !== 'Admin' && adderInfo.role !== 'Owner')){
        return res.status(400).json({
            message : "Only Admin or Owner can Manage Members",
        });
    }

    if(role === 'Admin' && adderInfo.role !== 'Owner'){ //only Owner can add Admin
        return res.status(400).json({
            message : "Only Owner can give Admin role",
        });
    }

    const user = await User.findOne({email : email.trim().toLowerCase()}).select(' _id name email');

    if(!user){
      return res.status(400).json({
        message: 'User Not Found',
      });
    }

    const userExisted = await OrganizationMembership.findOne({ organization_Id: organizationId, user_Id: user._id});

    if(userExisted){
        return res.status(400).json({ message : "User is Already Existing in Organization"});
    }

    const membership = await OrganizationMembership.create({
        organization_Id : organizationId,
        user_Id : user._id,
        role : role,
    });

    return res.status(200).json({
      message: "Member added in Organization successfully",
      membership: {
        _id: membership._id,
        organization_Id: membership.organization_Id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    });

 }catch(err){

    console.log(err);

    return res.status(500).json({
        message : "Failed to add user in organization."
    })
 }

};


export const removeOrganizationMember = async(req,res) =>{
    try{
        const {organizationId , userId} = req.params;

        const removerInfo = await OrganizationMembership.findOne({organization_Id : organizationId , user_Id : req.user._id});

        if(!removerInfo || (removerInfo.role !== 'Admin' && removerInfo.role !== 'Owner')){
            return res.status(400).json({
                message: "Only Admin or Owner can Remove members."
            });
        };

        const targetUser = await OrganizationMembership.findOne({organization_Id : organizationId , user_Id : userId});

        if(!targetUser){
            return res.status(400).json({
                message: "User is not a Organization Member."
            });
        }

        if(targetUser.role === 'Admin' && removerInfo.role !== 'Owner'){
            return res.status(400).json({message : "Only Owner can remove Admin"});
        }

        const session = await mongoose.startSession();

        try{

            await session.withTransaction(async () =>{

                //find all teams in organization and delete users record from this teams

                const organizationTeams = await Team.find({organization_Id: organizationId}).select('_id');
                const teamIds = organizationTeams.map((team) => team._id);

                const isHead = await TeamMembership.exists({team_Id:{ $in : teamIds}, user_Id: userId, role:'Head'});

                if(isHead){
                  return res.status(400).json({
                    message: 'User is Team head , Cant be Removed , Change Team Head first.'
                  });
                }

                await TeamMembership.deleteMany({user_Id : userId , team_Id : {$in : teamIds}} , {session});

                await OrganizationMembership.deleteOne({_id : targetUser._id} , {session});
            });

        }
        finally{
            await session.endSession();
        }

        return res.status(200).json({
            message: 'Organization member removed Successfully',
        });
    }
    catch(err){
        console.log(err);

        return res.status(200).json({
            message : "Error removing Member"
        });
    }
}