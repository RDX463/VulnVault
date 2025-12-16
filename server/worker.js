const { Worker, connection } = require('./utils/queue');
const { spawn } = require('child_process');
const path = require('path');
const logger = require('./utils/logger');
const axios = require('axios');

logger.info('[Worker] Listening for jobs...');

const worker = new Worker('scan-queue', async (job) => {
  // Extract data correctly from job.data
  const { target, scanType } = job.data;
  logger.info(`[Worker] Processing Job ${job.id}: ${scanType} scan on ${target}`);

  return new Promise((resolve, reject) => {
    // 1. Define Paths
    // Use system python3 as we fixed earlier
    const pythonPath = 'python3'; 
    const scriptPath = path.resolve(__dirname, '../engine/scanner.py');

    // 2. Spawn Python
    const pythonProcess = spawn(pythonPath, [scriptPath, target, scanType]);
    
    let dataBuffer = '';

    // Collect data chunks
    pythonProcess.stdout.on('data', (data) => {
        dataBuffer += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        try {
          // 1. Parse the JSON result ONCE
          const result = JSON.parse(dataBuffer);
          
          if (result.error) {
             return reject(new Error(result.error));
          }

          logger.info(`[Worker] Job ${job.id} completed successfully.`);

          // 2. Send Alert (Fire and forget, or await if you want to log success)
          await sendDiscordAlert(job, result);

          // 3. Resolve the job (Save to Redis)
          resolve(result);

        } catch (e) {
          logger.error(`[Worker] Failed to parse JSON for Job ${job.id}`);
          reject(new Error('Failed to parse scanner output'));
        }
      } else {
        logger.error(`[Worker] Scanner exited with code ${code}`);
        reject(new Error(`Scanner process exited with code ${code}`));
      }
    });
  });
}, { connection });

worker.on('completed', (job) => {
  logger.info(`[Worker] Job ${job.id} marked as completed in Queue!`);
});

worker.on('failed', (job, err) => {
  logger.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});

async function sendDiscordAlert(job, result) {
  const webhookUrl = process.env.DISCORD_WEBHOOK;
  if (!webhookUrl) return;
  const target = job.data.target; 
  const type = job.data.scanType || 'quick';

  // Count open ports safely
  let portCount = 0;
  if (result.nmaprun && result.nmaprun.host && result.nmaprun.host.ports && result.nmaprun.host.ports.port) {
      const ports = result.nmaprun.host.ports.port;
      portCount = Array.isArray(ports) ? ports.length : 1;
  }

  const message = {
    username: "VulnVault Scanner",
    embeds: [{
      title: `🛡️ Scan Completed: ${target}`,
      // Red (15158332) if ports open, Green (3066993) if safe
      color: portCount > 0 ? 15158332 : 3066993, 
      fields: [
        { name: "Target", value: target, inline: true },
        { name: "Type", value: type, inline: true },
        { name: "Open Ports Found", value: `${portCount}`, inline: true }
      ],
      timestamp: new Date()
    }]
  };

  try {
    await axios.post(webhookUrl, message);
    logger.info('[Worker] Discord notification sent.');
  } catch (err) {
    logger.error(`[Worker] Failed to send Discord alert: ${err.message}`);
  }
}
