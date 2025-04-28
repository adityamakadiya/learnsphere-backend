const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { expressjwt } = require('express-jwt');
const { errorHandler } = require('./src/utils/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const studentRoutes = require('./src/routes/studentRoutes')
const { port } = require('./src/config');



const app = express();
dotenv.config();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/sessions', sessionRoutes);
app.use('/students', studentRoutes);

app.listen(port,()=>{
  console.log("server is running on port",port);
})