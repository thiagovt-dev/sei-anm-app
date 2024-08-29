import express from 'express';
import routes from './routes/index.js';
import path from 'path';
import { initDBService } from './database/index.js';
import cronJobs from './services/cron/cron.js';
import { setupSwagger } from './swagger.js';

const app = express();

app.use(express.json());

routes(app);
setupSwagger(app);

const appPort = process.env.FORWARD_APP_PORT || 3000;
app.use(express.static(path.join('public')));


app.listen(appPort, async () => {
   try {
     await initDBService();
     console.log(`Server running on port http://localhost:${appPort}`);
     cronJobs();
   } catch (error) {
     console.error('Error starting server:', error);
   }
});