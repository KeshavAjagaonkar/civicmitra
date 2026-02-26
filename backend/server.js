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

// --- Socket.IO Authentication Middleware ---
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name role department');
    if (!user) {
      return next(new Error('User not found'));
    }
    // Attach user to socket for use in event handlers
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      department: user.department?.toString(),
    };
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Auto-join user's own notification room (verified from JWT — no client input)
  socket.join(socket.user.id);

  // Handle joining complaint-specific chat rooms (with authorization)
  socket.on('join_room', async (roomId) => {
    try {
      const complaint = await Complaint.findById(roomId).select('citizenId department workerId');
      if (!complaint) return;

      const userId = socket.user.id;
      const userRole = socket.user.role;
      const userDept = socket.user.department;

      const isOwner = complaint.citizenId.toString() === userId;
      const isStaff = userRole === 'staff' && complaint.department && userDept &&
        complaint.department.toString() === userDept;
      const isWorker = userRole === 'worker' && complaint.workerId &&
        complaint.workerId.toString() === userId;
      const isAdmin = userRole === 'admin';

      if (isOwner || isStaff || isWorker || isAdmin) {
        socket.join(roomId);
      }
      // Silently reject unauthorized joins — no error emitted
    } catch (err) {
      // Invalid roomId format or DB error — silently ignore
    }
  });

  // Handle leaving rooms
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('disconnect', () => { });
});

// Middleware
app.use(cors(corsOptions)); // Use configured CORS for Express
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Rate Limiting - More lenient in development to accommodate React Strict Mode and multiple hooks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Higher limit in dev due to React Strict Mode doubling API calls
  message: 'Too many requests, please try again later.',
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

