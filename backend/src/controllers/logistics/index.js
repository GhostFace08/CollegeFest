const Logistics = require("../../models/Logistics");
const { success, error } = require("../../utils/responseHelper");

const getLogistics = async (req, res) => {
  try {
    const logistics = await Logistics.findOne({ event: req.params.eventId }).populate("event", "title venue date");
    if (!logistics) return error(res, "Logistics not found", 404);
    return success(res, { logistics });
  } catch (err) {
    return error(res, err.message);
  }
};

const updateLogistics = async (req, res) => {
  try {
    const { venue, checklist, notes } = req.body;
    const logistics = await Logistics.findOneAndUpdate(
      { event: req.params.eventId },
      { venue, checklist, notes, updatedBy: req.user._id },
      { new: true }
    );
    if (!logistics) return error(res, "Logistics not found", 404);
    return success(res, { logistics }, "Logistics updated");
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getLogistics, updateLogistics };