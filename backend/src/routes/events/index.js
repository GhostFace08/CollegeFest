const router = require("express").Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, submitForApproval, getMyEvents } = require("../../controllers/events");
const { protect } = require("../../middlewares/auth");
const { allow, requireApproved } = require("../../middlewares/roleGuard");

router.get("/", getAllEvents);
router.get("/admin/mine", protect, allow("admin"), requireApproved, getMyEvents);
router.get("/:id", getEventById);
router.post("/", protect, allow("admin"), requireApproved, createEvent);
router.put("/:id", protect, allow("admin"), requireApproved, updateEvent);
router.delete("/:id", protect, allow("admin"), requireApproved, deleteEvent);
router.post("/:id/submit", protect, allow("admin"), requireApproved, submitForApproval);

module.exports = router;