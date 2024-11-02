const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden if the token is invalid
      }

      req.user = user; // Store the user information in the request object
      next(); // Move to the next middleware or route handler
    });
  } else {
    res.sendStatus(401); // Unauthorized if no token is provided
  }
};

module.exports = authenticateToken;
