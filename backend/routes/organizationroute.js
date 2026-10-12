import express from "express";

import authMiddleware from "../middleware/authmiddleware.js";

import { createOrganization , getMyOrganizations , getOrganizationById , addOrganizationMember , removeOrganizationMember } from "../controllers/OrganizationController.js";

const router = express.Router();

router.post('/' , authMiddleware , createOrganization);

router.get('/' , authMiddleware , getMyOrganizations);

router.get('/:organizationId' , authMiddleware , getOrganizationById);

router.post('/:organizationId/members' , authMiddleware , addOrganizationMember);

router.delete('/:organizationId/members/:userId' , authMiddleware , removeOrganizationMember);

export default router;


