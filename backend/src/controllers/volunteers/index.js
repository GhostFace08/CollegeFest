const Volunteer = require("../../models/Volunteer");
const { success, error } = require("../../utils/responseHelper");

const addVolunteer = async (req, res) => {
  try {
    const { name, email, phone, committee } = req.body;
    const volunteer = await Volunteer.create({ name, email, phone, committee, addedBy: req.user._id });
    return success(res, { volunteer }, "Volunteer added", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

const getVolunteers = async (req, res) => {
  try {
    const filter = { addedBy: req.user._id };
    if (req.query.event) filter["assignments.event"] = req.query.event;
    const volunteers = await Volunteer.find(filter).populate("assignments.event", "title date");
    return success(res, { volunteers });
  } catch (err) {
    return error(res, err.message);
  }
};

const assignVolunteer = async (req, res) => {
  try {
    const { eventId, role } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return error(res, "Volunteer not found", 404);
    volunteer.assignments.push({ event: eventId, role });
    await volunteer.save();
    return success(res, { volunteer }, "Assigned");
  } catch (err) {
    return error(res, err.message);
  }
};

const markAttendance = async (req, res) => {
  try {
    const { assignmentId, attended } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return error(res, "Volunteer not found", 404);
    const assignment = volunteer.assignments.id(assignmentId);
    if (!assignment) return error(res, "Assignment not found", 404);
    assignment.attended = attended;
    await volunteer.save();
    return success(res, { volunteer }, "Attendance marked");
  } catch (err) {
    return error(res, err.message);
  }
};

const deleteVolunteer = async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    return success(res, {}, "Volunteer removed");
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { addVolunteer, getVolunteers, assignVolunteer, markAttendance, deleteVolunteer };