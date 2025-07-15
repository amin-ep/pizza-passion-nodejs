import { Router } from "express";
import ProtectMiddlewares from "../middlewares/protection.js";
import OrderController from "../controllers/order.controller.js";
import validate from "../middlewares/validate.js";
import {
  validateCreateOrder,
  validateEditOrder,
} from "../validators/order.validators.js";
import SetField from "../middlewares/setField.js";

const router = Router();

const { protect, restrictTo } = new ProtectMiddlewares();

const {
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  createDocument,
  getMyOrders,
} = new OrderController();

const { setCustomerOnBody } = new SetField();

router.use(protect);

router
  .route("/")
  .get(restrictTo("admin"), getAllDocuments)
  .post(setCustomerOnBody, validate(validateCreateOrder), createDocument);

router.get("/myOrders", getMyOrders);

router
  .route("/:id")
  .get(getDocumentById)
  .patch(validate(validateEditOrder), updateDocumentById)
  .delete(restrictTo("admin"), deleteDocumentById);

export default router;
