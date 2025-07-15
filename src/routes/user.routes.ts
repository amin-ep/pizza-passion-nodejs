import { Router } from "express";
import Protect from "../middlewares/protection.js";
import UserController from "../controllers/user.controller.js";
import checkID from "../utils/checkId.js";
import validate from "../middlewares/validate.js";
import {
  validateUpdatePassword,
  validateUpdateMe,
  validateUpdateUser,
  validateUpdateEmail,
  validateUpdateEmailVerify,
} from "../validators/user.validators.js";
import { uploadImageUrl } from "../utils/upload.js";
import setImageOnBody from "../utils/setImage.js";

const router = Router();

const { protect, restrictTo } = new Protect();
const user = new UserController();

router.use(protect);

router
  .route("/")
  .post(restrictTo("admin"), user.createDocument)
  .get(restrictTo("admin"), user.getAllDocuments);

router.patch(
  "/updateMe",
  uploadImageUrl,
  setImageOnBody,
  validate(validateUpdateMe),
  user.updateMe
);
router.patch(
  "/updatePassword",
  validate(validateUpdatePassword),
  user.updateMyPassword
);

router.post("/updateEmail", validate(validateUpdateEmail), user.updateEmail);
router.post("/updateEmailResend", user.updateEmailResendCode);

router.patch(
  "/updateEmailVerify",
  validate(validateUpdateEmailVerify),
  user.updateEmailVerify
);

router.get("/me", user.getMe, user.getDocumentById);

router.param("id", checkID);
router
  .route("/:id")
  .get(restrictTo("admin"), user.getDocumentById)
  .patch(
    restrictTo("admin"),
    validate(validateUpdateUser),
    user.updateDocumentById
  )
  .delete(restrictTo("admin"), user.deleteDocumentById);

export default router;
