const Registration = require("../../models/Registration");
const Event = require("../../models/Event");
const Finance = require("../../models/Finance");
const { generateQR } = require("../../utils/qrGenerator");
const { sendRegistrationMail, sendCapacityAlertMail } = require("../../utils/mailer");
const { success, error } = require("../../utils/responseHelper");
const { v4: uuidv4 } = require("uuid");
const { CAPACITY_ALERT_THRESHOLD } = require("../../config/constants");

// POST /api/registrations
const register = async (req, res) => {
  try {
    const { eventId, teamMembers } = req.body;
    const event = await Event.findById(eventId);
    if (!event || event.status !== "approved") return error(res, "Event not found or not available", 404);
    if (event.registeredCount >= event.capacity) return error(res, "Event is full", 400);

    const existing = await Registration.findOne({ event: eventId, student: req.user._id, status: "confirmed" });
    if (existing) return error(res, "Already registered", 400);

    const registrationId = `CF-${uuidv4().slice(0, 8).toUpperCase()}`;
    const qrCode = await generateQR({ registrationId, eventId, studentId: req.user._id, eventTitle: event.title, studentName: req.user.name });

    const registration = await Registration.create({
      event: eventId, student: req.user._id,
      teamMembers: teamMembers || [], qrCode, registrationId, status: "confirmed",
    });

    event.registeredCount += 1;
    await event.save();

    const finance = await Finance.findOne({ event: eventId });
    if (finance) { finance.expectedRevenue += event.entryFee; await finance.save(); }

    try { await sendRegistrationMail(req.user.email, req.user.name, event.title, registrationId, qrCode); } catch (_) {}

    const ratio = event.registeredCount / event.capacity;
    if (ratio >= CAPACITY_ALERT_THRESHOLD) {
      const admin = await require("../../models/User").findById(event.createdBy);
      if (admin) { try { await sendCapacityAlertMail(admin.email, event.title, event.registeredCount, event.capacity); } catch (_) {} }
    }

    return success(res, { registration }, "Registered successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/registrations/my
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id }).populate("event", "title date venue status");
    return success(res, { registrations });
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE /api/registrations/:id (cancel)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({ _id: req.params.id, student: req.user._id, status: "confirmed" });
    if (!registration) return error(res, "Registration not found", 404);

    registration.status = "cancelled";
    await registration.save();

    await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
    return success(res, {}, "Registration cancelled");
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/registrations/verify (admin QR scan)
const verifyQR = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const registration = await Registration.findOne({ registrationId }).populate("event", "title date venue").populate("student", "name email");
    if (!registration) return error(res, "Invalid QR", 404);
    if (registration.status === "cancelled") return error(res, "Registration cancelled", 400);
    if (registration.checkedIn) return error(res, "Already checked in", 400);

    registration.checkedIn = true;
    registration.status = "attended";
    await registration.save();

    return success(res, { registration }, "Check-in successful");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/registrations/event/:eventId (admin)
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId }).populate("student", "name email phone");
    return success(res, { registrations });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { register, getMyRegistrations, cancelRegistration, verifyQR, getEventRegistrations };