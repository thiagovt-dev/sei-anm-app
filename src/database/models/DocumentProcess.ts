import { DataTypes, Model, Sequelize, type InferAttributes, type InferCreationAttributes } from 'sequelize';

export interface DocumentProcessInterface {
  id: number;
  documentPath: string;
  documentNumber: number;
  documentType: string;
  documentDate: string;
  registerDate: string;
  processId: number;
}

export class DocumentProcess
  extends Model<InferAttributes<DocumentProcess>, InferCreationAttributes<DocumentProcess>>
  implements DocumentProcessInterface
{
  declare id: number;
  declare documentNumber: number;
  declare documentPath: string;
  declare documentType: string;
  declare documentDate: string;
  declare registerDate: string;
  declare processId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default (sequelize: Sequelize) => {
  DocumentProcess.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      documentNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      documentPath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      registerDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      processId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'DocumentProcess',
    }
  );
 
  return DocumentProcess;
};
