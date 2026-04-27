const router = require("express").Router();
const { addVolunteer, getVolunteers, assignVolunteer, markAttendance, deleteVolunteer } = require("../../controllers/volunteers");
const { protect } = require("../../middlewares/auth");
const { allow, requireApproved } = require("../../middlewares/roleGuard");

router.use(protect, allow("admin"), requireApproved);
router.get("/", getVolunteers);
router.post("/", addVolunteer);
router.post("/:id/assign", assignVolunteer);
router.patch("/:id/attendance", markAttendance);
router.delete("/:id", deleteVolunteer);

module.exports = router;