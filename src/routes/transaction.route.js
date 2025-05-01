const transactionController = require('../controllers/transaction.controller');
const express = require('express');
const router = express.Router();

// Create a new transaction
router.post('/create', transactionController.createTransaction);

// Pay for a transaction
router.post('/pay/:id', transactionController.payTransaction);

// Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Get all transactions for a user
router.get('/user/:user_id', transactionController.getUserTransactions);

module.exports = router;