import { Sequelize } from 'sequelize';
import ProcessModel from './Process.js';
import DocumentProcessModel from './DocumentProcess.js';

export default (sequelize: Sequelize) => {
    const Process = ProcessModel(sequelize);
    const DocumentProcess = DocumentProcessModel(sequelize);

    return {
        Process,
        DocumentProcess,
    };
};
