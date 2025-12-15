const Joi = require('joi');
const { myQueue } = require('../utils/queue');
const logger = require('../utils/logger');

const scanSchema = Joi.object({
    target: Joi.string().ip({ version: ['ipv4'] }).required(),
    scanType: Joi.string().valid('quick', 'full').required()
});

// 1. POST /api/scan -> Start the Job
exports.runScan = async (req, res) => {
    const { error, value } = scanSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // Add job to queue
        const job = await myQueue.add('scan', value);
        logger.info(`Job added to queue: ${job.id}`);
        
        // Respond immediately with Job ID
        res.json({ jobId: job.id, status: 'queued' });
    } catch (err) {
        logger.error(`Queue error: ${err.message}`);
        res.status(500).json({ error: 'Failed to add scan to queue' });
    }
};

// 2. GET /api/scan/:id -> Check Status
exports.getScanStatus = async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await myQueue.getJob(jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const result = job.returnvalue; // This is where BullMQ stores the resolve() data

        if (state === 'completed') {
            res.json({ status: 'completed', result });
        } else if (state === 'failed') {
            res.json({ status: 'failed', error: job.failedReason });
        } else {
            res.json({ status: 'active' }); // waiting or active
        }
    } catch (err) {
        res.status(500).json({ error: 'Status check failed' });
    }
};
