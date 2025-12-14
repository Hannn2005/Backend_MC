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
    origin: ['http://localhost:5173',
    'https://moneycash-nu.vercel.app/'
    ],
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


app.listen(PORT, () => {
  console.log(`server berjalan di port ${PORT}`);
});
