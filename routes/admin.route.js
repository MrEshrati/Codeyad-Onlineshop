const express = require("express");
const isAuthenticated = require("../middleware/is_auth.middleware");
const adminController = require("../controllers/admin.controller");
const router = express.Router();
const { check, body } = require("express-validator");

router.get("/products", isAuthenticated, adminController.getProducts);
router.get("/add-product", isAuthenticated, adminController.getAddProduct);
router.get(
  "/edit-product/:productId",
  isAuthenticated,
  adminController.getEditProduct,
);
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").toString().isLength({ min: 5, max: 500 }).trim(),
  ],
  isAuthenticated,
  adminController.postAddProduct,
);
router.post("/edit-product", isAuthenticated, adminController.postEditProduct);
router.post("/delete-product", isAuthenticated, adminController.deleteProduct);

module.exports = router;
