import express from 'express';
import { addNewDocument } from '../controllers/chromaController.js';

const router = express.Router();

router.post('/', addNewDocument);

export default router;