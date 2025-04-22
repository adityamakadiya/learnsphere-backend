const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler } = require('./src/utils/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const { port } = require('./src/config');
const app = express();
dotenv.config();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', authRoutes);

app.listen(port,()=>{
  console.log("server is running on port",port);
})