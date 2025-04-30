const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/index');

const auth = (req,res,next) => {
  const token = req.cookies.accessToken;
  if(!token){
    res.status(401).json({error: 'No token Provided'})
  }
  try{
    // const decoded = jwt.verify(token , jwtSecret);    
    // req.user = decoded;
    // next();

    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    // console.log(req.user);
    next();
    
  }catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  } 
}

module.exports = auth;