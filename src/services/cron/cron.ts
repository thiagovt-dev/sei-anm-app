import cron from 'node-cron';
import logger from 'src/handlers/logs/logger.js';
import { ProcessService } from 'src/services/processService/processService.js';

let isRunning = false;
const processService = new ProcessService();

export default function cronJobs() {
  cron.schedule(
    '0 6 * * *',
    async () => {
      logger.info('Iniciando o cron job para verificar e atualizar processos...');
      if (isRunning) {
        logger.warn('Cron job já está em execução. Aguardando...');
        return;
      }

      isRunning = true;

      try {
        await processService.updateProcessIfNeeded();
        logger.info('Cron job finalizado com sucesso.');
      } catch (error) {
        logger.error(`Erro durante a execução do cron job: ${error.message || error}`, { stack: error.stack });
      } finally {
        isRunning = false;
      }
    },
    {
      timezone: 'America/Sao_Paulo',
    }
  );
}
