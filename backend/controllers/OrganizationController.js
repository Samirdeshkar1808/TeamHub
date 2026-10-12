import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";



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


// GET  /organizations/:id

export const getOrganizationById = async(req , res) =>{

    try{

        const { id } = req.params;

        const membership = await OrganizationMembership.findOne({organization_Id: id, user_Id : req.user._id});

        if(!membership) {
           return res.status(404).json({
            message: 'Organization not found',
           });
        }

        const organization = await Organization.findById(id);

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