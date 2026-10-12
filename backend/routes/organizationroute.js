import express from "express";

import authMiddleware from "../middleware/authmiddleware.js";

import { createOrganization , getMyOrganizations , getOrganizationById } from "../controllers/OrganizationController.js";

const router = express.Router();

router.post('/' , authMiddleware , createOrganization);

router.get('/' , authMiddleware , getMyOrganizations);

router.get('/:id' , authMiddleware , getOrganizationById);

export default router;


