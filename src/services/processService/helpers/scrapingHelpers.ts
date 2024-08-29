import axios from 'axios';
import runScraping from 'src/services/scraping/runScraping.js';
import { Process } from 'src/database/models/Process.js';
import { updateDocuments } from './documentHelpers.js';
import { ServiceError } from 'src/handlers/errors/ServiceError.js';

export const checkAndUpdateProcess = async (process: Process) => {
  try {
    const url = `https://sei.anm.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?${process.processHash}`;

    const response = await axios.get(url);
    if (!response.data.includes('Processo não encontrado.')) {
      console.log(`Processo encontrado para: ${process.processNumber}. Executando scraping...`);

      const newHash = await runScraping(process.processNumber);
      await process.update({ processHash: newHash });
      await updateDocuments(process.processNumber, process.id);

      console.log(`Processo ${process.processNumber} atualizado com sucesso.`);
    } else {
      console.log(`Processo não encontrado para: ${process.processNumber}. Nenhuma ação necessária.`);
    }
  } catch (error) {
    console.error(`Erro ao verificar e atualizar processo: ${error.message || error}`);
    throw new ServiceError(`Erro ao verificar e atualizar processo: ${error.message || error}`);
  }
};
