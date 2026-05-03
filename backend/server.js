const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ✅ Root route (pehle hi hona chahiye)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Team Task Manager API is running' });
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

// ❗ 404 handler (LAST me)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ❗ Global error handler (sabse last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
