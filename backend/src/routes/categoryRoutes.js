const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticationToken = require('../middlewares/auth');

// 公开路由
router.get('/', categoryController.getAllCategories);

// 需要认证的路由
router.post('/', authenticationToken, categoryController.createCategory);

module.exports = router;
