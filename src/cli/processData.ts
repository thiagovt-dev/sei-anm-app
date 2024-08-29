import { initDBService } from "src/database/index.js";
import cronJobs from "src/services/cron/cron.js";

initDBService().then(() => cronJobs());