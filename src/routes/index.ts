import { Express } from 'express';
import apiRouter from './api.js';

const routes = (app: Express) => {
  app.use('/api', apiRouter);
};

export default routes;