import { Request, Response } from 'express';
import { ProcessService } from '../services/processService/processService.js';
import { ControllerError } from 'src/handlers/errors/ControllerError.js';
import logger from 'src/handlers/logs/logger.js';

/**
 * @swagger
 * tags:
 *   name: Processos
 *   description: API para gerenciar processos
 */
export class ProcessController {
  private processService: ProcessService;

  constructor() {
    this.processService = new ProcessService();
  }

  /**
   * @swagger
   * /api/pesquisa/processos/:
   *   post:
   *     summary: Cria um novo processo ou retorna um existente com documentos
   *     tags: [Processos]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               processNumber:
   *                 type: string
   *                 description: Número do processo a ser criado ou pesquisado
   *     responses:
   *       200:
   *         description: Processo criado ou retornado com sucesso, incluindo documentos relacionados
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 processNumber:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                 documentProcess:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       documentPath:
   *                         type: string
   *                       documentNumber:
   *                         type: integer
   *                       documentType:
   *                         type: string
   *                       documentDate:
   *                         type: string
   *                       registerDate:
   *                         type: string
   *       400:
   *         description: Erro na criação ou pesquisa do processo
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  async createProcess(req: Request, res: Response) {
    try {
      const { processNumber } = req.body;
      const process = await this.processService.createProcess(processNumber);
      return res.status(200).json(process);
    } catch (error) {
      logger.error(`Erro no controlador ao criar processo: ${error.message || error}`, { stack: error.stack });
      return res.status(400).json({ error: `Erro ao criar processo: ${error.message || error}` });
    }
  }
}
