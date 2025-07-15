import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import ProtectMiddlewares from "../middlewares/protection.js";
import validate from "../middlewares/validate.js";
import { validateAddToCart } from "../validators/cart.validators.js";
import SetField from "../middlewares/setField.js";

const router = Router();

const { protect } = new ProtectMiddlewares();
const {
  addToCart,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  removeFromCart,
  deleteDocumentById,
  getMyCart,
} = new CartController();

const { setCustomerOnBody } = new SetField();
router.use(protect);
router
  .route("/")
  .get(getAllDocuments)
  .post(setCustomerOnBody, validate(validateAddToCart), addToCart);
router.delete("/deleteItem/:itemId", removeFromCart);
router.get("/myCart", getMyCart);
router
  .route("/:id")
  .get(getDocumentById)
  .patch(updateDocumentById)
  .delete(deleteDocumentById);

export default router;
