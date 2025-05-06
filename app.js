const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { expressjwt } = require('express-jwt');
const { errorHandler } = require('./src/utils/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const studentRoutes = require('./src/routes/studentRoutes')
const progressRoutes = require('./src/routes/progressRoutes');
const ratingRoutes = require('./src/routes/ratingRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes')
const { port } = require('./src/config');
const cookieParser = require('cookie-parser');



const app = express();
dotenv.config();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// app.use('/auth/google', rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// }));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/sessions', sessionRoutes);
app.use('/students', studentRoutes);
app.use('/progress/', progressRoutes);
app.use('/ratings', ratingRoutes);
app.use('/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(port,()=>{
  console.log("server is running on port",port);
})