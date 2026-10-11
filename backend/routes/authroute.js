import expreess from 'express';
import { signup , login } from '../controllers/authUser.js';

const router = expreess.Router();

router.post('/signup' , signup);

router.post('/login' , login);

export default router;
