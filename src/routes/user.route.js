const userController = require('../controllers/user.controller');
const express = require('express');
const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/:email', userController.getUserByEmail);
router.put('/', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/getAll', userController.getAllUsers);
router.post('/topUp', userController.topUpUser);  // Added topUp endpoint

module.exports = router;