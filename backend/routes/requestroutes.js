import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';

import{getRequestById, decideRequest, updateRequestStatus, cancelRequest , assignedRequests , assignRequestMember} from '../controllers/RequestController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/assigned-requests' , assignedRequests);
router.get('/:requestId', getRequestById);
router.patch('/:requestId/decision', decideRequest);
router.patch('/:requestId/status', updateRequestStatus);
router.patch('/:requestId/cancel', cancelRequest);
router.patch("/:requestId/assign", assignRequestMember);
export default router;
