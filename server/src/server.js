require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { setupSocket } = require('./sockets/orderSocket');
const { startLowStockJob } = require('./jobs/lowStockCron');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CrustCraft API is running' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Setup Socket
setupSocket(io);

const PORT = process.env.PORT || 5000;

const Pizza = require('./models/Pizza');
const seedDB = require('./seed/seed');

connectDB().then(async () => {
  // Auto-seed database if empty
  try {
    const pizzaCount = await Pizza.countDocuments();
    if (pizzaCount === 0) {
      console.log('🍕 Database is empty. Seeding initial CrustCraft data...');
      await seedDB(false);
    } else {
      console.log(`🍕 Database has ${pizzaCount} pizzas. Skipping auto-seed.`);
    }
  } catch (seedErr) {
    console.error('❌ Failed to run auto-seed checks:', seedErr.message);
  }

  server.listen(PORT, () => {
    console.log(`🍕 CrustCraft server running on port ${PORT}`);
  });
  // Start Cron Jobs
  startLowStockJob();
}).catch((error) => {
  console.error('Database connection failed', error);
  process.exit(1);
});

module.exports = { app, server };

