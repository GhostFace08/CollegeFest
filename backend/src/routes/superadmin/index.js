const router = require("express").Router();
const {
  createCommittee, getCommittees, updateCommittee, deleteCommittee,
  getPendingAdmins, approveAdmin, rejectAdmin, updateAdminCommittees, deactivateAdmin, getAllAdmins,
  getPendingEvents, approveEvent, rejectEvent, unpublishEvent,
  getGlobalDashboard,
} = require("../../controllers/superadmin");
const { protect } = require("../../middlewares/auth");
const { allow } = require("../../middlewares/roleGuard");

router.use(protect, allow("superadmin"));

router.get("/dashboard", getGlobalDashboard);
router.get("/committees", getCommittees);
router.post("/committees", createCommittee);
router.put("/committees/:id", updateCommittee);
router.delete("/committees/:id", deleteCommittee);

router.get("/admins", getAllAdmins);
router.get("/admins/pending", getPendingAdmins);
router.patch("/admins/:id/approve", approveAdmin);
router.delete("/admins/:id/reject", rejectAdmin);
router.patch("/admins/:id/committees", updateAdminCommittees);
router.patch("/admins/:id/deactivate", deactivateAdmin);

router.get("/events/pending", getPendingEvents);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);
router.patch("/events/:id/unpublish", unpublishEvent);

module.exports = router;