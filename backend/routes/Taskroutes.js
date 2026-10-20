import express from 'express';

import {getTaskById , updateTask , updateTaskStatus , deleteTask } from '../controllers/TaskController.js';

const router = express.Router();

import authMiddleware from '../middleware/authmiddleware.js';

router.use(authMiddleware); //now no need to write authMiddleware in every route , it will directly use it for all routes in this file.


router.get('/:taskId', getTaskById);

router.patch('/:taskId', updateTask);

router.patch('/:taskId/status', updateTaskStatus);

router.delete('/:taskId', deleteTask);


export default router;