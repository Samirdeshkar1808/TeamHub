import express from 'express';

const router = express.Router({mergeParams:true}); 
//to access organizationId id here  because base route is '/:organizationId/teams'

import authMiddleware from '../middleware/authmiddleware.js';
import { createTeam , getTeams , getTeamById , addTeamMember , removeTeamMember , changeTeamHead} from '../controllers/TeamController.js';

import { createTask , getTasks } from '../controllers/TaskController.js';

import { createRequest, getRequests} from '../controllers/RequestController.js';


router.post('/' , authMiddleware , createTeam);
router.get('/' ,authMiddleware , getTeams);
router.get('/:teamId' , authMiddleware , getTeamById);
router.post('/:teamId/members' , authMiddleware, addTeamMember);
router.delete('/:teamId/members/:userId',authMiddleware , removeTeamMember);
router.post('/:teamId/head' , authMiddleware , changeTeamHead);

router.post('/:teamId/tasks' , authMiddleware , createTask);
router.get('/:teamId/tasks' , authMiddleware , getTasks);

router.post('/:teamId/requests',authMiddleware , createRequest);
router.get('/:teamId/requests',authMiddleware, getRequests);


export default router;