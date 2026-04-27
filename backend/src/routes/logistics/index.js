const router = require("express").Router();
const { getLogistics, updateLogistics } = require("../../controllers/logistics");
const { protect } = require("../../middlewares/auth");
const { allow, requireApproved } = require("../../middlewares/roleGuard");

router.use(protect, allow("admin", "superadmin"), requireApproved);
router.get("/:eventId", getLogistics);
router.put("/:eventId", updateLogistics);

module.exports = router;