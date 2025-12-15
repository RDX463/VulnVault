const { Worker, connection } = require('./utils/queue');
const { spawn } = require('child_process');
const path = require('path');
const logger = require('./utils/logger');

logger.info('[Worker] Listening for jobs...');

const worker = new Worker('scan-queue', async (job) => {
  const { target, scanType } = job.data;
  logger.info(`[Worker] Processing Job ${job.id}: ${scanType} scan on ${target}`);

  return new Promise((resolve, reject) => {
    // 1. Define Paths (Same as before)
    const pythonPath = path.resolve(__dirname, '../engine/venv/bin/python3');
    const scriptPath = path.resolve(__dirname, '../engine/scanner.py');

    // 2. Spawn Python
    const pythonProcess = spawn(pythonPath, [scriptPath, target, scanType]);
    
    let dataBuffer = '';

    pythonProcess.stdout.on('data', (data) => dataBuffer += data.toString());
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Scanner process failed'));
      }
      try {
        const result = JSON.parse(dataBuffer);
        if (result.error) return reject(new Error(result.error));
        
        // Return the data. BullMQ stores this in Redis automatically!
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse JSON output'));
      }
    });
  });
}, { connection });

worker.on('completed', (job) => {
  logger.info(`[Worker] Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  logger.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});
