const router = require("express").Router();
const { register, getMyRegistrations, cancelRegistration, verifyQR, getEventRegistrations } = require("../../controllers/registration");
const { protect } = require("../../middlewares/auth");
const { allow, requireApproved } = require("../../middlewares/roleGuard");

router.post("/", protect, allow("student"), register);
router.get("/my", protect, allow("student"), getMyRegistrations);
router.delete("/:id", protect, allow("student"), cancelRegistration);
router.post("/verify", protect, allow("admin", "superadmin"), requireApproved, verifyQR);
router.get("/event/:eventId", protect, allow("admin", "superadmin"), requireApproved, getEventRegistrations);

module.exports = router;