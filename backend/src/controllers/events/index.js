const Event = require("../../models/Event");
const Finance = require("../../models/Finance");
const Logistics = require("../../models/Logistics");
const { success, error } = require("../../utils/responseHelper");

// GET /api/events (public - approved only)
const getAllEvents = async (req, res) => {
  try {
    const { category, date } = req.query;
    const filter = { status: "approved" };
    if (category) filter.category = category;
    if (date) filter.date = { $gte: new Date(date) };
    const events = await Event.find(filter).populate("committee", "name").populate("createdBy", "name");
    return success(res, { events });
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/events/:id (public)
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("committee", "name").populate("createdBy", "name");
    if (!event) return error(res, "Event not found", 404);
    return success(res, { event });
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/events (admin)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, capacity, teamSize, entryFee, committee } = req.body;
    const event = await Event.create({
      title, description, category, date, time, venue, capacity,
      teamSize, entryFee, committee, createdBy: req.user._id, status: "draft",
    });
    await Finance.create({ event: event._id, committee, budget: 0, expectedRevenue: 0 });
    await Logistics.create({ event: event._id, checklist: [], updatedBy: req.user._id });
    return success(res, { event }, "Event created", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// PUT /api/events/:id (admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { ...req.body, status: "draft" },
      { new: true }
    );
    if (!event) return error(res, "Event not found or unauthorized", 404);
    return success(res, { event }, "Event updated");
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE /api/events/:id (admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!event) return error(res, "Event not found or unauthorized", 404);
    return success(res, {}, "Event deleted");
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/events/:id/submit (admin submits for approval)
const submitForApproval = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id, status: "draft" },
      { status: "pending" },
      { new: true }
    );
    if (!event) return error(res, "Event not found or already submitted", 404);
    return success(res, { event }, "Submitted for approval");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/events/admin/mine (admin sees own events)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).populate("committee", "name");
    return success(res, { events });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, submitForApproval, getMyEvents };