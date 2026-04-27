const { error } = require("../utils/responseHelper");

const allow = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, "Access denied", 403);
    }
    next();
  };
};

const requireApproved = (req, res, next) => {
  if (req.user.role === "admin" && !req.user.isApproved) {
    return error(res, "Admin account pending approval", 403);
  }
  next();
};

module.exports = { allow, requireApproved };