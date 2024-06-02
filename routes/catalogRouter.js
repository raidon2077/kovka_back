const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');


// Роуты для товаров
router.get('/product', catalogController.getAllProducts);
router.get('/product/:id', catalogController.getOneProduct);

// Роуты для типов товаров
router.get('/type', catalogController.getAllTypes);

module.exports = router;