const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/index');

const auth = (req,res,next) => {
  const token = req.header('Authorization').split(' ')[1];
  if(!token){
    res.status(401).json({error: 'No token Provided'})
  }
  try{
    // const decoded = jwt.verify(token , jwtSecret);    
    // req.user = decoded;
    // next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    // console.log(req.user);
    next();
    
  }catch(err){
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;