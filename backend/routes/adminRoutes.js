import express from 'express';
import {
  createForm,
  addFieldToForm,
  getFormById,
  getFormResponse,
  getAllFormsWithStatus
} from '../controlllers/adminController.js';

const router = express.Router();

router.post('/forms', createForm);
router.post('/forms/:id/fields', addFieldToForm);
router.get('/forms/:id', getFormById);
router.get('/forms/:id/response', getFormResponse);
router.get('/forms', getAllFormsWithStatus);


export default router;
