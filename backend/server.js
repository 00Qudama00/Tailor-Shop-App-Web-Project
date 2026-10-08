require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

const placeholder = require('./routes/placeholderRoutes');

// Phase 1: only authentication is implemented
app.use('/api/auth', require('./routes/authRoutes'));

// not implemented yet: empty data for reads, 501 for changes
app.use('/api/auth', placeholder.shop);
app.use('/api/customers', placeholder.customers);
app.use('/api/orders', placeholder.orders);
app.use('/api/employees', placeholder.employees);
app.use('/api/suit-types', placeholder.suitTypes);
app.use('/api/expenses', placeholder.expenses);
app.use('/api/dashboard', placeholder.dashboard);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// serve the built React app in production
const clientBuild = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.use((req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in the .env file');
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
