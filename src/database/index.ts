import sequelize from './config.js';
import models from './models/index.js';
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const initDBService = async () => {
    try {
        await wait(5000);
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        models(sequelize);
        await sequelize.sync();

    console.log('Models synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, initDBService };
