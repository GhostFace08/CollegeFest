const User = require("../../models/User");
const Committee = require("../../models/Committee");
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const { success, error } = require("../../utils/responseHelper");

// Committee CRUD
const createCommittee = async (req, res) => {
  try {
    const { name, description } = req.body;
    const committee = await Committee.create({ name, description, createdBy: req.user._id });
    return success(res, { committee }, "Committee created", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

const getCommittees = async (req, res) => {
  try {
    const committees = await Committee.find().populate("admins", "name email");
    return success(res, { committees });
  } catch (err) {
    return error(res, err.message);
  }
};

const updateCommittee = async (req, res) => {
  try {
    const committee = await Committee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!committee) return error(res, "Committee not found", 404);
    return success(res, { committee }, "Committee updated");
  } catch (err) {
    return error(res, err.message);
  }
};

const deleteCommittee = async (req, res) => {
  try {
    await Committee.findByIdAndDelete(req.params.id);
    return success(res, {}, "Committee deleted");
  } catch (err) {
    return error(res, err.message);
  }
};

// Admin approvals
const getPendingAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin", isApproved: false }).select("-password");
    return success(res, { admins });
  } catch (err) {
    return error(res, err.message);
  }
};

const approveAdmin = async (req, res) => {
  try {
    const { committeeIds } = req.body;
    const admin = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, committees: committeeIds },
      { new: true }
    ).select("-password");
    if (!admin) return error(res, "Admin not found", 404);

    await Committee.updateMany({ _id: { $in: committeeIds } }, { $addToSet: { admins: admin._id } });
    return success(res, { admin }, "Admin approved");
  } catch (err) {
    return error(res, err.message);
  }
};

const rejectAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return success(res, {}, "Admin request rejected");
  } catch (err) {
    return error(res, err.message);
  }
};

const updateAdminCommittees = async (req, res) => {
  try {
    const { committeeIds } = req.body;
    const admin = await User.findByIdAndUpdate(req.params.id, { committees: committeeIds }, { new: true }).select("-password");
    if (!admin) return error(res, "Admin not found", 404);
    await Committee.updateMany({}, { $pull: { admins: admin._id } });
    await Committee.updateMany({ _id: { $in: committeeIds } }, { $addToSet: { admins: admin._id } });
    return success(res, { admin }, "Committees updated");
  } catch (err) {
    return error(res, err.message);
  }
};

const deactivateAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true }).select("-password");
    if (!admin) return error(res, "Admin not found", 404);
    return success(res, { admin }, "Admin deactivated");
  } catch (err) {
    return error(res, err.message);
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password").populate("committees", "name");
    return success(res, { admins });
  } catch (err) {
    return error(res, err.message);
  }
};

// Event approvals
const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).populate("committee", "name").populate("createdBy", "name email");
    return success(res, { events });
  } catch (err) {
    return error(res, err.message);
  }
};

const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: "approved", rejectionNote: "" }, { new: true });
    if (!event) return error(res, "Event not found", 404);
    return success(res, { event }, "Event approved");
  } catch (err) {
    return error(res, err.message);
  }
};

const rejectEvent = async (req, res) => {
  try {
    const { note } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { status: "rejected", rejectionNote: note }, { new: true });
    if (!event) return error(res, "Event not found", 404);
    return success(res, { event }, "Event rejected");
  } catch (err) {
    return error(res, err.message);
  }
};

const unpublishEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: "unpublished" }, { new: true });
    if (!event) return error(res, "Event not found", 404);
    return success(res, { event }, "Event unpublished");
  } catch (err) {
    return error(res, err.message);
  }
};

// Global dashboard
const getGlobalDashboard = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ status: "approved" });
    const totalRegistrations = await Registration.countDocuments({ status: { $ne: "cancelled" } });
    const totalAdmins = await User.countDocuments({ role: "admin", isApproved: true });
    const pendingAdmins = await User.countDocuments({ role: "admin", isApproved: false });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const committees = await Committee.find().populate("admins", "name");
    const eventsByCommittee = await Event.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$committee", count: { $sum: 1 } } },
    ]);
    return success(res, { totalEvents, totalRegistrations, totalAdmins, pendingAdmins, pendingEvents, committees, eventsByCommittee });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  createCommittee, getCommittees, updateCommittee, deleteCommittee,
  getPendingAdmins, approveAdmin, rejectAdmin, updateAdminCommittees, deactivateAdmin, getAllAdmins,
  getPendingEvents, approveEvent, rejectEvent, unpublishEvent,
  getGlobalDashboard,
};