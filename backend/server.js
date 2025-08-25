import http from 'http';
import express from 'express';
import path from 'path';
import 'dotenv/config';
import connectDB from './config/database.js';
import { initializeWSS } from './websocket/ocpp_server.js';
import cookieParser from 'cookie-parser';

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
app.get('/', (req, res) => res.send('CSMS Server is running.'));

// API Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/sessions', sessionRoutes);

// --- Initialize WebSocket Server ---
// Pass the HTTP server to the WebSocket initializer
initializeWSS(server);

// --- Production Static Files (must be after API routes) ---

// Serve static files for production
if (process.env.NODE_ENV === "production") {
  console.log('ProductionMode')
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // app.get("*", (req, res) =>
  //   res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  // );
  try {
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    );
  } catch (err) {
    console.error('Wildcard route error:', err);
  }
} else {
  console.log('devmode')
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// --- Start Listening ---
server.listen(PORT, () => {
    console.log(`HTTP Server is running on port:${PORT}`);
    console.log(`OCPP WebSocket Server is listening on the same port.`);
});