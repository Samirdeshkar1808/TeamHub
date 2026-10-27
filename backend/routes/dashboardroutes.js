import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
import { getDashboard , getMyTasks , getTeamDashboard , getOrganizationInfo} from '../controllers/DashboardController.js';

import { getAllTasks } from '../controllers/TaskController.js';
import { getAllRequests } from '../controllers/RequestController.js';

const router = express.Router();

router.use(authMiddleware);


router.get('/summary' , getDashboard);
router.get('/my-tasks' , getMyTasks);
router.get('/team/:teamId', getTeamDashboard);
router.get('/organization/:organizationId', getOrganizationInfo );

router.get('/:organizationId/all-tasks' , getAllTasks);
router.get('/:organizationId/all-requests', getAllRequests);


export default router;



