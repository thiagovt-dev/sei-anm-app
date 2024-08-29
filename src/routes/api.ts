import express from 'express';
import { ProcessController } from '../controllers/processController.js';

const router = express.Router();
const processController = new ProcessController(); 

router.post('/pesquisa/processos/', (req, res) => processController.createProcess(req, res));

export default router;