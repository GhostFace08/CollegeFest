const router = require("express").Router();
const { getFinanceByEvent, updateFinance, addSponsor, getSponsors, updateSponsor, deleteSponsor } = require("../../controllers/finance");
const { protect } = require("../../middlewares/auth");
const { allow, requireApproved } = require("../../middlewares/roleGuard");

router.use(protect, allow("admin", "superadmin"), requireApproved);
router.get("/event/:eventId", getFinanceByEvent);
router.put("/event/:eventId", updateFinance);
router.get("/sponsors", getSponsors);
router.post("/sponsors", addSponsor);
router.put("/sponsors/:id", updateSponsor);
router.delete("/sponsors/:id", deleteSponsor);

module.exports = router;