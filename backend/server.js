const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const { setSocketIO } = require('./utils/socket');

// Load environment variables IMMEDIATELY
dotenv.config();

// Attempt to connect to the database
connectDB();

const app = express();
const server = http.createServer(app);

// --- ROBUST CORS CONFIGURATION ---
// Create a list of allowed origins. Filter out any empty or undefined values.
const allowedOrigins = [
  'http://localhost:5173', // Default Vite port
  'http://localhost:5174', // Alternative Vite port
  process.env.FRONTEND_URL,
].filter(Boolean); // This ensures that if FRONTEND_URL is not set, it's simply ignored.

if (process.env.NODE_ENV === 'development') {
  console.log('Allowed CORS Origins:', allowedOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
// --- END OF CORRECTION ---

// Set up Socket.IO with the same CORS options
const io = new Server(server, {
  cors: corsOptions,
});

setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`Socket.IO User Connected: ${socket.id}`);

  // Handle joining user-specific notification room
  socket.on('join_notifications', (userId) => {
    socket.join(userId.toString());
    console.log(`Socket ${socket.id} joined notification room for user: ${userId}`);
  });

  // Handle joining complaint-specific rooms
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Handle leaving rooms
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket.IO User Disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors(corsOptions)); // Use configured CORS for Express
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use('/api', limiter);

// Logger in development
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/chats', require('./routes/chats'));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('CivicMitra API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

module.exports = { app, server, io };

