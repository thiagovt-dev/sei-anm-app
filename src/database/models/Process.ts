import { DataTypes, Model, Sequelize, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { ModelError } from 'src/handlers/errors/ModelError.js';
import runScraping from 'src/services/scraping/runScraping.js';
import DocumentProcessModel from './DocumentProcess.js';

export interface ProcessInterface {
  id: number;
  processNumber: string;
  processHash?: string;
}

export class Process
  extends Model<InferAttributes<Process>, InferCreationAttributes<Process>>
  implements ProcessInterface
{
  declare id: number;
  declare processNumber: string;
  declare processHash?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default (sequelize: Sequelize) => {
  const DocumentProcess = DocumentProcessModel(sequelize);
  Process.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      processNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      processHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Process',
      hooks: {
        afterCreate: async (process) => {
          try {
            const processHash = await runScraping(process.processNumber);
            await process.update({ processHash });
          } catch (error) {
            console.error(`Erro ao atualizar o processHash: ${error.message || error}`);
            throw new ModelError(`Erro ao executar o scraping e atualizar o processHash: ${error.message || error}`);
          }
        },
      },
    }
  );
  Process.hasMany(DocumentProcess, {
    foreignKey: 'processId',
    as: 'documentProcess',
  });
  DocumentProcess.belongsTo(Process, {
    foreignKey: 'processId',
    as: 'process',
  });
  return Process;
};
