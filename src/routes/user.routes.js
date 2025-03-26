const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const contractController = require('../controllers/contract.controller');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/review', contractController.createReview);
router.get('/', userController.getAllDesigners);
router.post('/update', userController.updateUser);
router.get('/:id', userController.getDesignerById);
router.post('/follow', userController.followUser);

module.exports = router;
