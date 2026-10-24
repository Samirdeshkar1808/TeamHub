import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
import { getDashboard , getMyTasks , getTeamDashboard , getOrganizationInfo} from '../controllers/DashboardController.js';

const router = express.Router();

router.use(authMiddleware);


router.get('/summary' , getDashboard);
router.get('/my-tasks' , getMyTasks);
router.get('/team/:teamId', getTeamDashboard);
router.get('/organization/:organizationId', getOrganizationInfo );


export default router;



