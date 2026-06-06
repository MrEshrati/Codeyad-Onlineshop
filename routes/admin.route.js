const express = require('express');
const isAuthenticated = require('../middleware/is_auth.middleware');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

router.get('/products',isAuthenticated,adminController.getProducts);
router.get('/add-product',isAuthenticated,adminController.getAddProduct);
router.get('/edit-product/:productId',isAuthenticated,adminController.getEditProduct);
router.post('/add-product',isAuthenticated,adminController.postAddProduct);
router.post('/edit-product',isAuthenticated,adminController.postEditProduct);
router.post('/delete-product',isAuthenticated,adminController.deleteProduct);

module.exports = router;