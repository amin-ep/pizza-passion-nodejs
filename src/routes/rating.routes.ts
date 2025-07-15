import { Router } from "express";
import RatingController from "../controllers/rating.controller.js";
import ProtectMiddlewares from "../middlewares/protection.js";
import SetField from "../middlewares/setField.js";
import validate from "../middlewares/validate.js";
import { validateCreateRating } from "../validators/rating.validators.js";

const {
  createDocument,
  deleteDocumentById,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  checkUserHasRated,
} = new RatingController();

const { protect } = new ProtectMiddlewares();

const { setUserOnBody } = new SetField();

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getAllDocuments)
  .post(
    setUserOnBody,
    validate(validateCreateRating),
    checkUserHasRated,
    createDocument
  );
router.route("/:id").get(getDocumentById).delete(deleteDocumentById);

export default router;
