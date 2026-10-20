import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';

import{getRequestById, decideRequest, updateRequestStatus, cancelRequest} from '../controllers/RequestController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:requestId', getRequestById);
router.patch('/:requestId/decision', decideRequest);
router.patch('/:requestId/status', updateRequestStatus);
router.patch('/:requestId/cancel', cancelRequest);

export default router;
