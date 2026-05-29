require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./src/config/db');

// ROUTES
const authRoutes = require('./src/routes/authRoutes');
const txnRoutes = require('./src/routes/txnRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const bankRoutes = require('./src/routes/bankRoutes');
const travelRoutes = require('./src/routes/travelRoutes');
const app = express();

// CONNECT DB
connectDB();
// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message:
      'Backend Running'
  });

});


// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transactions', txnRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/travel', travelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ${PORT}`
  );
});