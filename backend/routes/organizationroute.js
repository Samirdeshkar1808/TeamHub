import express from "express";

import authMiddleware from "../middleware/authmiddleware.js";

import { createOrganization , getMyOrganizations , getOrganizationById , addOrganizationMember , removeOrganizationMember } from "../controllers/OrganizationController.js";
import { createTeam , getTeams } from "../controllers/TeamController.js";

const router = express.Router();

router.post('/' , authMiddleware , createOrganization);

router.get('/' , authMiddleware , getMyOrganizations);

router.get('/:organizationId' , authMiddleware , getOrganizationById);


router.post('/:organizationId/members' , authMiddleware , addOrganizationMember);

router.delete('/:organizationId/members/:userId' , authMiddleware , removeOrganizationMember);

router.post('/:organizationId/teams' , authMiddleware , createTeam);
router.get('/:organizationId/teams' , authMiddleware , getTeams);

export default router;


