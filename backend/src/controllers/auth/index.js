const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { success, error } = require("../../utils/responseHelper");
const { JWT_EXPIRES_IN } = require("../../config/constants");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// POST /api/auth/register (student)
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone, college, year } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered", 400);

    const user = await User.create({ name, email, password, phone, college, year, role: "student", isApproved: true });
    const token = signToken(user._id);
    return success(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "Registered successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/auth/register-admin (admin request)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered", 400);

    const user = await User.create({ name, email, password, phone, role: "admin", isApproved: false });
    return success(res, {}, "Admin request submitted. Awaiting Super Admin approval.", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
const user = await User.findOne({ email }).populate("committees", "name");
    if (!user || !(await user.comparePassword(password))) return error(res, "Invalid credentials", 401);
    if (user.role === "admin" && !user.isApproved) return error(res, "Account pending approval", 403);

    const token = signToken(user._id);
return success(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, committees: user.committees } });
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("committees", "name");
    return success(res, { user });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { registerStudent, registerAdmin, login, getMe };