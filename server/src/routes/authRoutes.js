const express = require("express");

const { register, login, me, logout,} = require("../controllers/authController");

const validate = require("../middleware/validate");
const {registerSchema,loginSchema,} = require("../validations/authValidation");

const { authenticate } = require("../middleware/authMiddleware");


const router = express.Router();


router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);


router.get("/me", authenticate, me);

router.post("/logout", authenticate, logout);


module.exports = router;