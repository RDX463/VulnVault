require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger'); // We will create this next
const scanRoutes = require('./routes/scanRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000", // Docker Frontend
    "http://localhost:5173", // Vite Local Dev
    "http://127.0.0.1:3000"  // Docker IP variant
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Prevent DoS by limiting body size

// 2. Rate Limiting (Big Tech Standard)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter);

// 3.Register Routes
app.use('/api', scanRoutes);

// 4. Health Check (For Kubernetes/Docker)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[Server] Running securely on port ${PORT}`);
});

