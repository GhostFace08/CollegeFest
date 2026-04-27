const Finance = require("../../models/Finance");
const Sponsor = require("../../models/Sponsor");
const { success, error } = require("../../utils/responseHelper");

const getFinanceByEvent = async (req, res) => {
  try {
    const finance = await Finance.findOne({ event: req.params.eventId }).populate("event", "title entryFee registeredCount");
    if (!finance) return error(res, "Finance record not found", 404);
    return success(res, { finance });
  } catch (err) {
    return error(res, err.message);
  }
};

const updateFinance = async (req, res) => {
  try {
    const { budget, expenses } = req.body;
    const finance = await Finance.findOneAndUpdate(
      { event: req.params.eventId },
      { budget, expenses, updatedBy: req.user._id },
      { new: true }
    );
    if (!finance) return error(res, "Finance record not found", 404);
    return success(res, { finance }, "Finance updated");
  } catch (err) {
    return error(res, err.message);
  }
};

const addSponsor = async (req, res) => {
  try {
    const { name, dealAmount, dealType, notes, committee } = req.body;
    const sponsor = await Sponsor.create({ name, dealAmount, dealType, notes, committee, addedBy: req.user._id, actionChecklist: [] });
    return success(res, { sponsor }, "Sponsor added", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ addedBy: req.user._id });
    return success(res, { sponsors });
  } catch (err) {
    return error(res, err.message);
  }
};

const updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sponsor) return error(res, "Sponsor not found", 404);
    return success(res, { sponsor }, "Sponsor updated");
  } catch (err) {
    return error(res, err.message);
  }
};

const deleteSponsor = async (req, res) => {
  try {
    await Sponsor.findByIdAndDelete(req.params.id);
    return success(res, {}, "Sponsor deleted");
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getFinanceByEvent, updateFinance, addSponsor, getSponsors, updateSponsor, deleteSponsor };