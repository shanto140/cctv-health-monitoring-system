const cron = require('node-cron');
const db = require('../config/db');
const healthCheckService = require('../services/healthCheckService');


const checkCameraStream = async (camera) => {
  return { connected: false, frameBuffer: null, issueType: null };
};

const runHealthCheck = async () => {
  const [cameras] = await db.query('SELECT * FROM cameras WHERE is_active = TRUE');
  for (const camera of cameras) {
    const result = await checkCameraStream(camera);
    await healthCheckService.processCameraHealthCheck(camera, result);
  }
};


const startHealthCheckCron = () => {
  cron.schedule('*/5 * * * *', () => {
    runHealthCheck().catch((err) => console.error('Health check cron error:', err));
  });
};

module.exports = { startHealthCheckCron, runHealthCheck };
