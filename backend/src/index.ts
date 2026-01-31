import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes, { initializeServices } from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const normalizeOrigin = (value: string) => value.replace(/\/$/, '');
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
]
    .filter(Boolean)
    .map((value) => normalizeOrigin(value as string));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

// Initialize services
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || '';
const PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || '';
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS || '';

if (!RPC_URL || !PRIVATE_KEY || !REGISTRY_ADDRESS) {
    console.error('⚠️  Warning: Missing environment variables!');
    console.error('Please set: SEPOLIA_RPC_URL, BACKEND_PRIVATE_KEY, REGISTRY_CONTRACT_ADDRESS');
    console.error('Using mock mode for development...\n');
} else {
    initializeServices(RPC_URL, PRIVATE_KEY, REGISTRY_ADDRESS);
    console.log('✅ Services initialized with contract:', REGISTRY_ADDRESS);
}

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Hyde Backend API',
        version: '1.0.0',
        description: 'ENS Context Scoring & Tier Management',
        endpoints: {
            health: 'GET /api/health',
            verifyENS: 'POST /api/verify-ens',
            contextScore: 'GET /api/context-score/:address',
            tier: 'GET /api/tier/:address',
            checkAccess: 'GET /api/check-access/:address/:minTier',
            arcSettlement: 'POST /api/arc/settlement',
            arcSettlementStatus: 'GET /api/arc/settlement/:transactionId',
            storkStream: 'GET /api/stork/stream',
        },
    });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Hyde Backend API');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('\n📚 Available endpoints:');
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/verify-ens`);
    console.log(`   GET  /api/context-score/:address`);
    console.log(`   GET  /api/tier/:address`);
    console.log(`   GET  /api/check-access/:address/:minTier`);
    console.log(`   POST /api/arc/settlement`);
    console.log(`   GET  /api/arc/settlement/:transactionId`);
    console.log(`   GET  /api/stork/stream`);
    console.log('\n✨ Ready to serve!\n');
});

export default app;
