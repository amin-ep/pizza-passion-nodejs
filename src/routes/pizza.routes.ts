import { Router } from "express";
import ProtectMiddlewares from "../middlewares/protection.js";
import PizzaController from "../controllers/pizza.controller.js";
import setImageOnBody from "../utils/setImage.js";
import validate from "../middlewares/validate.js";
import { validateCreatePizza } from "../validators/pizza.validators.js";
import { uploadImageUrl } from "../utils/upload.js";

const router = Router();

const { protect, restrictTo } = new ProtectMiddlewares();
const {
  createDocument,
  deleteDocumentById,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
} = new PizzaController();

router
  .route("/")
  .get(getAllDocuments)
  .post(
    protect,
    restrictTo("admin"),
    uploadImageUrl,
    setImageOnBody,
    validate(validateCreatePizza),
    createDocument
  );

router
  .route("/:id")
  .get(getDocumentById)
  .patch(protect, restrictTo("admin"), updateDocumentById)
  .delete(protect, restrictTo("admin"), deleteDocumentById);

export default router;
