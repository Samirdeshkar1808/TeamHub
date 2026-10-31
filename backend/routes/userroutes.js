import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';

import { profile } from '../controllers/UserController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/userInfo' , profile);

export default router;

