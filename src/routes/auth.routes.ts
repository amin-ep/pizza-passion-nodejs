import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {
  validateForgetPassword,
  validateSignup,
  validateResetPassword,
  validateVerifyEmail,
} from "../validators/auth.validator.js";

const router = Router();

const auth = new AuthController();

router.post("/signup", validate(validateSignup), auth.register);
router.post("/verify", validate(validateVerifyEmail), auth.verifyEmail);
router.post("/requestVerifyEmail", auth.requestEmailVerificationCode);
router.post("/login", auth.login);
router.post(
  "/forgetPassword",
  validate(validateForgetPassword),
  auth.forgetPassword
);

router.patch(
  "/recoverPassword/:recoverId",
  validate(validateResetPassword),
  auth.resetPassword
);

export default router;
