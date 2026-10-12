import express from 'express';

const router = express.Router({mergeParams:true}); 
//to access organizationId id here  because base route is '/organizations/:organizationId/teams'

import authMiddleware from '../middleware/authmiddleware.js';
import { createTeam , getTeams , getTeamById} from '../controllers/TeamController.js';

router.post('/' , authMiddleware , createTeam);
router.get('/' ,authMiddleware , getTeams);
router.get('/:teamId' , authMiddleware , getTeamById);

export default router;