const { spawn } = require('child_process');
const path = require('path');
const Joi = require('joi');
const logger = require('../utils/logger'); // The logger we fixed earlier!

// 1. Validation Schema (Strict Defense)
const scanSchema = Joi.object({
    target: Joi.string().ip({ version: ['ipv4'] }).required(), // Only allow valid IPv4
    scanType: Joi.string().valid('quick', 'full').required()
});

exports.runScan = (req, res) => {
    // 2. Validate Input
    const { error, value } = scanSchema.validate(req.body);
    if (error) {
        logger.warn(`Invalid scan attempt: ${error.details[0].message}`);
        return res.status(400).json({ error: error.details[0].message });
    }

    const { target, scanType } = value;
    logger.info(`Starting ${scanType} scan on ${target}`);

    // 3. Define Paths
    // We explicitly point to the VIRTUAL ENV Python to ensure dependencies are found
    const pythonPath = path.resolve(__dirname, '../../engine/venv/bin/python3');
    const scriptPath = path.resolve(__dirname, '../../engine/scanner.py');
    
   //Debugging Log: Print exactly what we are trying to run 
    logger.info('Spawning Python: ${pythonPath} running ${scriptPath}');
    // 4. Spawn the Process
    const pythonProcess = spawn(pythonPath, [scriptPath, target, scanType]);

    let dataBuffer = '';
    let errorBuffer = '';

    // Collect data as it comes in
    pythonProcess.stdout.on('data', (data) => {
        dataBuffer += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorBuffer += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            logger.error(`Scan failed with code ${code}: ${errorBuffer}`);
            return res.status(500).json({ error: 'Internal Scanner Error' });
        }

        try {
            // Parse the JSON output from Python
            const result = JSON.parse(dataBuffer);
            
            // Check if Python reported its own error (e.g. valid JSON but scan failed)
            if (result.error) {
                logger.warn(`Scanner reported error: ${result.error}`);
                return res.status(400).json(result);
            }

            logger.info(`Scan completed successfully for ${target}`);
            res.json(result);

        } catch (e) {
            logger.error(`Failed to parse Python output: ${dataBuffer}`);
            res.status(500).json({ error: 'Failed to process scan results' });
        }
    });
};
