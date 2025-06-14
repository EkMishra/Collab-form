import express from 'express';
import { createUser, joinForm } from '../controlllers/userController.js';

const router = express.Router();

router.post('/users', createUser);
router.post('/forms/:inviteCode/join', joinForm);

export default router;
