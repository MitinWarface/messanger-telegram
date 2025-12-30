import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import database from './config/database.js';
import redisClient from './config/redis.js';
import { SMSCService } from './config/smsc.js';
import { initializeDatabase } from './database/init.js';

import { setupAuthRoutes } from './controllers/auth.controller.js';
import { setupAdminRoutes } from './controllers/admin.controller.js';
import { setupChatRoutes } from './controllers/chat.controller.js';
import { ChatSocketHandlers } from './sockets/chat.handlers.js';

dotenv.config();

// Create __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize services
const smscService = new SMSCService();

// Database initialization
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch((err) => {
  console.error('Database initialization error:', err);
});

// Setup routes
setupAuthRoutes(app);
setupAdminRoutes(app);
setupChatRoutes(app);

// Serve static files from uploads directory
app.use('/api/uploads', express.static(process.env.UPLOADS_PATH || '/data/uploads'));

// Routes will be added here
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Telegram Clone API Server' });
});

// Setup Socket.IO handlers
const chatHandlers = new ChatSocketHandlers(io);
io.on('connection', (socket) => {
  console.log('New client connected');
  chatHandlers.setupSocketHandlers(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});