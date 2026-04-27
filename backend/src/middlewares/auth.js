const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/responseHelper");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return error(res, "No token provided", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return error(res, "User not found", 401);

    req.user = user;
    next();
  } catch (err) {
    return error(res, "Invalid token", 401);
  }
};

module.exports = { protect };