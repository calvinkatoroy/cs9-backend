const transactionRepository = require('../repositories/transaction.repository');
const userRepository = require('../repositories/user.repository');
const itemRepository = require('../repositories/item.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTransaction = async (req, res) => {
    try {
        const { item_id, quantity, user_id } = req.body;

        // Validate required fields
        if (!item_id || !user_id) {
            return baseResponse(res, false, 400, "Missing item_id or user_id", null);
        }

        // Validate quantity
        if (!quantity || quantity <= 0) {
            return baseResponse(res, false, 400, "Quantity must be larger than 0", null);
        }

        // Check if user exists
        const user = await userRepository.getUserById(user_id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }

        // Check if item exists and get its price
        const item = await itemRepository.getItemById(item_id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }

        // Check if item is in stock
        if (item.stock < quantity) {
            return baseResponse(res, false, 400, "Insufficient stock", null);
        }

        // Calculate total price
        const total = item.price * quantity;

        // Create transaction with pending status
        const transaction = await transactionRepository.createTransaction({
            user_id,
            item_id,
            quantity,
            total,
            status: 'pending'
        });

        return baseResponse(res, true, 201, "Transaction created", transaction);
    } catch (error) {
        console.error("❌ Create transaction error:", error);
        return baseResponse(res, false, 500, "Error creating transaction", null);
    }
};

exports.payTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate transaction id
        if (!id) {
            return baseResponse(res, false, 400, "Transaction ID is required", null);
        }

        // Get transaction details
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, "Transaction not found", null);
        }

        // Check if transaction is already paid
        if (transaction.status === 'paid') {
            return baseResponse(res, false, 400, "Transaction has already been paid", null);
        }

        // Get user and item details
        const user = await userRepository.getUserById(transaction.user_id);
        const item = await itemRepository.getItemById(transaction.item_id);

        if (!user || !item) {
            return baseResponse(res, false, 404, "User or item not found", null);
        }

        // Check if user has enough balance
        if (user.balance < transaction.total) {
            return baseResponse(res, false, 400, "Insufficient balance", null);
        }

        // Check if there's enough stock
        if (item.stock < transaction.quantity) {
            return baseResponse(res, false, 400, "Insufficient stock", null);
        }

        // Begin transaction process
        // 1. Update transaction status to 'paid'
        const updatedTransaction = await transactionRepository.updateTransactionStatus(id, 'paid');

        // 2. Deduct user balance
        const newBalance = user.balance - transaction.total;
        await userRepository.updateUserBalance(transaction.user_id, newBalance);

        // 3. Reduce item stock
        const newStock = item.stock - transaction.quantity;
        await itemRepository.updateItemStock(transaction.item_id, newStock);

        return baseResponse(res, true, 200, "Payment successful", updatedTransaction);
    } catch (error) {
        console.error("❌ Pay transaction error:", error);
        return baseResponse(res, false, 500, "Failed to pay", null);
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate transaction id
        if (!id) {
            return baseResponse(res, false, 400, "Transaction ID is required", null);
        }

        // Check if transaction exists
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, "Transaction not found", null);
        }

        // Delete transaction
        const deletedTransaction = await transactionRepository.deleteTransaction(id);

        return baseResponse(res, true, 200, "Transaction deleted", deletedTransaction);
    } catch (error) {
        console.error("❌ Delete transaction error:", error);
        return baseResponse(res, false, 500, "Error deleting transaction", null);
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate transaction id
        if (!id) {
            return baseResponse(res, false, 400, "Transaction ID is required", null);
        }

        // Get transaction
        const transaction = await transactionRepository.getTransactionById(id);
        if (!transaction) {
            return baseResponse(res, false, 404, "Transaction not found", null);
        }

        return baseResponse(res, true, 200, "Transaction found", transaction);
    } catch (error) {
        console.error("❌ Get transaction error:", error);
        return baseResponse(res, false, 500, "Error retrieving transaction", null);
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Validate user id
        if (!user_id) {
            return baseResponse(res, false, 400, "User ID is required", null);
        }

        // Check if user exists
        const user = await userRepository.getUserById(user_id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }

        // Get user transactions
        const transactions = await transactionRepository.getUserTransactions(user_id);

        return baseResponse(res, true, 200, "Transactions found", transactions);
    } catch (error) {
        console.error("❌ Get user transactions error:", error);
        return baseResponse(res, false, 500, "Error retrieving transactions", null);
    }
};