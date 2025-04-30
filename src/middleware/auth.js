// const jwt = require('jsonwebtoken');
// const { jwtSecret } = require('../config/index');

// const auth = (req,res,next) => {
//   const token = req.cookies.accessToken;
//   if(!token){
//     res.status(401).json({error: 'No token Provided'})
//   }
//   try{
//     // const decoded = jwt.verify(token , jwtSecret);    
//     // req.user = decoded;
//     // next();

//     const decoded = jwt.verify(token, jwtSecret);
//     req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
//     // console.log(req.user);
//     next();
    
//   }catch (err) {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   } 
// }

// module.exports = auth;

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/index');

const auth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log('auth/middleware: Access token present:', !!accessToken); // Debug
  if (!accessToken) {
    console.log('auth/middleware: No access token provided');
    return res.status(401).json({ error: 'No token Provided' });
  }
  try {
    const decoded = jwt.verify(accessToken, jwtSecret);
    console.log('auth/middleware: Token decoded, userId:', decoded.id); // Debug
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    console.error('auth/middleware: Invalid token:', err.message, err.stack); // Debug
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;