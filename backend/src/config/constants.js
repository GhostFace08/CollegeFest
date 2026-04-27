module.exports = {
  ROLES: {
    STUDENT: "student",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
  },
  EVENT_STATUS: {
    DRAFT: "draft",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    UNPUBLISHED: "unpublished",
  },
  REGISTRATION_STATUS: {
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    ATTENDED: "attended",
  },
  SPONSOR_STATUS: {
    CONTACTED: "contacted",
    NEGOTIATING: "negotiating",
    CONFIRMED: "confirmed",
    RECEIVED: "received",
  },
  JWT_EXPIRES_IN: "7d",
  CAPACITY_ALERT_THRESHOLD: 0.8, // 80%
};