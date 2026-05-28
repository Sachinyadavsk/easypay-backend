require('dotenv').config();

console.log('1 SERVER START');

const express = require('express');
console.log('2 EXPRESS LOADED');

const cors = require('cors');
console.log('3 CORS LOADED');

const swaggerUi =
  require('swagger-ui-express');

console.log('4 SWAGGER LOADED');

const connectDB =
  require('./src/config/db');

console.log('5 DB FILE LOADED');


// ROUTES
const authRoutes =
  require('./src/routes/authRoutes');

console.log('6 AUTH ROUTE');

const txnRoutes =
  require('./src/routes/txnRoutes');

console.log('7 TXN ROUTE');

const walletRoutes =
  require('./src/routes/walletRoutes');

console.log('8 WALLET ROUTE');

const bankRoutes =
  require('./src/routes/bankRoutes');

console.log('9 BANK ROUTE');

const travelRoutes =
  require('./src/routes/travelRoutes');

console.log('10 TRAVEL ROUTE');


const app = express();


// CONNECT DB
connectDB();

console.log('11 DB CONNECT FUNCTION CALLED');


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


const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `12 SERVER RUNNING ${PORT}`
  );
});