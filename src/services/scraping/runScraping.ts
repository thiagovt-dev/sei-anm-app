import { exec } from 'child_process';
import logger from 'src/handlers/logs/logger.js';

const runScraping = (processNumber: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const command = `python3 src/services/scraping/python/main.py ${processNumber}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Erro ao executar o scraping: ${error.message}`, { stack: error.stack });
        return reject(error);
      }

      logger.info(`Resultado do scraping: ${stdout}`);
      if (stderr) {
        logger.warn(`Erros durante o scraping: ${stderr}`);
      }

      // Capturar o hash da saída do Python
      const hashMatch = stdout.match(/Hash extraído: (.+)/);
      const processHash = hashMatch ? hashMatch[1] : null;

      if (processHash) {
        resolve(processHash);
      } else {
        const scrapingError = new Error('Hash não encontrado no resultado do scraping.');
        logger.error(scrapingError.message);
        reject(scrapingError);
      }
    });
  });
};

export default runScraping;
