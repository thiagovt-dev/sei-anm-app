import { ServiceError } from 'src/handlers/errors/ServiceError.js';
import { saveDocuments, updateDocuments } from './helpers/documentHelpers.js';
import { findExistingProcess, createNewProcess, getAllProcessesWithHash } from './helpers/processHelpers.js';
import { checkAndUpdateProcess } from './helpers/scrapingHelpers.js';
import { Process } from 'src/database/models/Process.js';
import { DocumentProcess } from 'src/database/models/DocumentProcess.js';
import logger from 'src/handlers/logs/logger.js';

export class ProcessService {
  async createProcess(processNumber: string) {
    try {
      const existingProcess = await findExistingProcess(processNumber);
      if (existingProcess) {
        return await this.getProcessWithDocuments(existingProcess.id);
      }

      const process = await createNewProcess(processNumber);
      await saveDocuments(process, processNumber);

      return await this.getProcessWithDocuments(process.id);
    } catch (error) {
      logger.error(`Erro ao criar o processo: ${error.message || error}`, { stack: error.stack });
      throw new ServiceError(`Erro ao criar o processo: ${error.message || error}`);
    }
  }

  async updateProcessIfNeeded() {
    try {
      const processes = await getAllProcessesWithHash();

      for (const process of processes) {
        await checkAndUpdateProcess(process);
      }
    } catch (error) {
      logger.error(`Erro ao verificar e atualizar processos: ${error.message || error}`, { stack: error.stack });
      throw new ServiceError(`Erro ao verificar e atualizar processos: ${error.message || error}`);
    }
  }

  private async getProcessWithDocuments(processId: number) {
    try {
      const process = await Process.findByPk(processId, {
        include: [
          {
            model: DocumentProcess,
            as: 'documentProcess',
            attributes: ['documentPath', 'documentNumber', 'documentType', 'documentDate', 'registerDate'],
          },
        ],
        attributes: ['id', 'processNumber', 'createdAt', 'updatedAt'],
      });

      if (!process) {
        throw new ServiceError(`Processo com ID ${processId} não encontrado.`);
      }

      return process;
    } catch (error) {
      logger.error(`Erro ao buscar processo com documentos: ${error.message || error}`, { stack: error.stack });
      throw new ServiceError(`Erro ao buscar processo com documentos: ${error.message || error}`);
    }
  }
}
