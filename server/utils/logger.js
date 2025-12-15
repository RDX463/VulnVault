const winston = require('winston');
const path = require('path');

// Define custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: path.join(__dirname, '../logs/app.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// Instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file)
  ],
  exitOnError: false
});

// Create a stream object with a 'write' function that will be used by `morgan` (HTTP logger) later
logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  }
};

module.exports = logger;
