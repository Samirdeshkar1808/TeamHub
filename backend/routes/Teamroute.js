import express from 'express';

const router = express.Router({mergeParams:true}); 
//to access organizationId id here  because base route is '/organizations/:organizationId/teams'

import authMiddleware from '../middleware/authmiddleware.js';
import { createTeam , getTeams , getTeamById , addTeamMember , removeTeamMember , changeTeamHead} from '../controllers/TeamController.js';

router.post('/' , authMiddleware , createTeam);
router.get('/' ,authMiddleware , getTeams);
router.get('/:teamId' , authMiddleware , getTeamById);
router.post('/:teamId/members' , authMiddleware, addTeamMember);
router.delete('/:teamId/members/:userId',authMiddleware , removeTeamMember);
router.post('/:teamId/head' , authMiddleware , changeTeamHead);

export default router;