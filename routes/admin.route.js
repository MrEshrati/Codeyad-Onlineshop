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
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Invalid Title"),
    body("price").isFloat().withMessage("Invalid Price"),
    body("description")
      .isString()
      .isLength({ min: 5, max: 500 })
      .trim()
      .withMessage("Invalid Description"),
  ],
  isAuthenticated,
  adminController.postAddProduct,
);
router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Invalid Title"),
    body("price").isFloat().withMessage("Invalid Price"),
    body("description")
      .isString()
      .isLength({ min: 5, max: 500 })
      .trim()
      .withMessage("Invalid Description"),
  ],
  isAuthenticated,
  adminController.postEditProduct,
);
router.post("/delete-product", isAuthenticated, adminController.deleteProduct);
router.delete('/product/:prodId',isAuthenticated,adminController.deleteProduct);

module.exports = router;
