const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/index');

const auth = (req,res,next) => {
  const token = req.header('Authorization')?.replace('Bearer', '');
  if(!token){
    res.status(401).json({error: 'No token Provided'})
  }
  try{
    const decoded = jwt.verify(token , jwtSecret);
    req.user = decoded;
    next();
  }catch(err){
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;