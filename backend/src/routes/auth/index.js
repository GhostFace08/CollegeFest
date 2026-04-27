const router = require("express").Router();
const { registerStudent, registerAdmin, login, getMe } = require("../../controllers/auth");
const { protect } = require("../../middlewares/auth");

router.post("/register", registerStudent);
router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;