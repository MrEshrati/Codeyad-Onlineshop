const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");

const authController = require("../controllers/auth.controller");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset-password", authController.getResetPass);
router.get("/reset-password/:token", authController.getUpdatePassword);
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Email is not valid").normalizeEmail(),
    check("password", "Please enter a valid password")
      .isLength({ min: 5, max: 25 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin,
);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Email is not valid")
      .custom((value, { req }) => {
        if (value === process.env.BLOCKED_SIGNUP_EMAIL) {
          throw new Error("You cannot access this website");
        }

        return true;
      })
      .normalizeEmail()
      .trim(),
    body(
      "password",
      "Password must be bigger than 5 letter and must contain lowercase and uppercase letters and have number and symbols",
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }

        return true;
      })
      .trim(),
  ],
  authController.postSignup,
);
router.post("/logout", authController.postLogout);
router.post("/reset-password", authController.postResetPass);
router.post("/update-password", authController.postUpdatePassword);

module.exports = router;
