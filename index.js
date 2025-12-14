const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDb = require('./initDb');
const userRoutes = require('./routes/user.js');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: false
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('api berjalan');
});
app.use('/api/auth', userRoutes)
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server berjalan di port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB init gagal', err);
    process.exit(1);
  });
