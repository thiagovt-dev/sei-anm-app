import { Op } from 'sequelize';
import { Process } from 'src/database/models/Process.js';
import { ServiceError } from 'src/handlers/errors/ServiceError.js';

export const findExistingProcess = async (processNumber: string) => {
  try {
    return await Process.findOne({ where: { processNumber } });
  } catch (error) {
    console.error(`Erro ao buscar o processo existente: ${error.message || error}`);
    throw new ServiceError(`Erro ao buscar o processo existente: ${error.message || error}`);
  }
};

export const createNewProcess = async (processNumber: string) => {
  try {
    return await Process.create({ processNumber });
  } catch (error) {
    console.error(`Erro ao criar um novo processo: ${error.message || error}`);
    throw new ServiceError(`Erro ao criar um novo processo: ${error.message || error}`);
  }
};

export const getAllProcessesWithHash = async () => {
  try {
    return await Process.findAll({ where: { processHash: { [Op.ne]: null } } });
  } catch (error) {
    console.error(`Erro ao buscar processos com hash: ${error.message || error}`);
    throw new ServiceError(`Erro ao buscar processos com hash: ${error.message || error}`);
  }
};
