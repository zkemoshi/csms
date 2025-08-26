import http from 'http';
import express from 'express';
import 'dotenv/config';
import connectDB from './config/database.js';
import { initializeWSS } from './websocket/ocpp_server.js';
import cookieParser from 'cookie-parser';
import path from 'path';

// Importing routes
import tokenRoutes from './routes/token.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import stationRoutes from './routes/stations.js';
import sessionRoutes from './routes/sessions.js';

// Importing middleware
import { notFound, errorHandler } from './middleware/errorHandler.js';

// --- Initialize ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// --- Connect to Database ---
await connectDB();

// --- Setup HTTP Routes ---
// app.get('/', (req, res) => res.send('CSMS Server is running.'));

// API Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/sessions', sessionRoutes);

// --- Initialize WebSocket Server ---
initializeWSS(server);

// --- Serve React App ---
if (process.env.NODE_ENV === 'production') {
  // ES module equivalent of __dirname using path
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html')));
}else{
  app.get('/', (req, res) => res.send('CSMS Server is running.'));
}



// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// --- Start Listening ---
server.listen(PORT, () => {
  console.log(`HTTP Server is running on port:${PORT}`);
  console.log(`OCPP WebSocket Server is listening on the same port.`);
});