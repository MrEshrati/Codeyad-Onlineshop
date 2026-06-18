const express = require("express");
const shopController = require("../controllers/shop.controller");
const isAuthenticated = require("../middleware/is_auth.middleware");
const router = express.Router();

router.get("/", shopController.getHome);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", shopController.getCart);
router.get("/orders", shopController.getOrders);
router.get("/invoices/:orderId", isAuthenticated, shopController.getInvoice);
router.get("/checkout", isAuthenticated, shopController.getCheckout);
router.get("/PaymentRequest", isAuthenticated, shopController.getPayment);
router.get("/checkPayment", isAuthenticated, shopController.checkPayment);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postRemovefromCart);
router.post("/create-order", shopController.postOrder);

module.exports = router;
