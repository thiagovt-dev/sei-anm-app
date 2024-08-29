import fs from 'fs/promises';
import path from 'path';
import { DocumentProcess } from 'src/database/models/DocumentProcess.js';
import { ServiceError } from 'src/handlers/errors/ServiceError.js';

export const saveDocuments = async (process: any, processNumber: string) => {
  try {
    const processFolderName = processNumber.replace(/\D/g, '');
    const jsonFilePath = path.resolve(`src/documentsProcess/${processFolderName}/document.json`);
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    const documents = JSON.parse(jsonData);

    for (const doc of documents) {
      await DocumentProcess.create({
        documentNumber: doc.numero_documento,
        documentPath: doc.caminho_arquivo,
        documentType: doc.tipo_documento,
        documentDate: doc.data_documento,
        registerDate: doc.data_registro,
        processId: process.id,
      });
    }
  } catch (error) {
    console.error(`Erro ao salvar documentos: ${error.message || error}`);
    throw new ServiceError(`Erro ao salvar documentos: ${error.message || error}`);
  }
};

export const updateDocuments = async (processNumber: string, processId: number) => {
  try {
    const processFolderName = processNumber.replace(/\D/g, '');
    const jsonFilePath = path.resolve(`src/documentsProcess/${processFolderName}/document.json`);
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    const documents = JSON.parse(jsonData);

    await DocumentProcess.destroy({ where: { processId } });

    for (const doc of documents) {
      await DocumentProcess.create({
        documentNumber: doc.numero_documento,
        documentPath: doc.caminho_arquivo,
        documentType: doc.tipo_documento,
        documentDate: doc.data_documento,
        registerDate: doc.data_registro,
        processId,
      });
    }
  } catch (error) {
    console.error(`Erro ao atualizar documentos: ${error.message || error}`);
    throw new ServiceError(`Erro ao atualizar documentos: ${error.message || error}`);
  }
};
