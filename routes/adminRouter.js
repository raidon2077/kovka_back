const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const checkrole = require('../middleware/checkRoleMiddleware');

// Роуты для админ панели
router.post('/addProduct', checkrole('ADMIN'), adminController.addProduct);
router.put('/editProduct/:productId', checkrole('ADMIN'), adminController.editProduct);
router.delete('/deleteProduct/:productId', adminController.deleteProduct);

router.post('/addType', adminController.createType);
router.delete('/deleteType/:typeId',  adminController.deleteType);

module.exports = router;