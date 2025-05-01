const db = require("../database/pg.database");

exports.createTransaction = async (transaction) => {
    try {
        const query = `
            INSERT INTO transactions (user_id, item_id, quantity, total, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_id, item_id, quantity, total, status, created_at
        `;
        
        const values = [
            transaction.user_id,
            transaction.item_id,
            transaction.quantity,
            transaction.total,
            transaction.status
        ];

        const res = await db.query(query, values);
        
        if (res.rowCount === 0) {
            console.error("⚠️ Transaction creation failed: No rows affected.");
            return null;
        }

        console.log("✅ Transaction successfully created:", res.rows[0]);
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to create transaction");
    }
};

exports.getTransactionById = async (id) => {
    try {
        const query = `
            SELECT id, user_id, item_id, quantity, total, status, created_at
            FROM transactions
            WHERE id = $1
        `;
        
        const res = await db.query(query, [id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get transaction by ID");
    }
};

exports.updateTransactionStatus = async (id, status) => {
    try {
        const query = `
            UPDATE transactions
            SET status = $1
            WHERE id = $2
            RETURNING id, user_id, item_id, quantity, total, status, created_at
        `;
        
        const res = await db.query(query, [status, id]);
        
        if (res.rowCount === 0) {
            console.error("⚠️ Transaction update failed: No rows affected.");
            return null;
        }
        
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to update transaction status");
    }
};

exports.deleteTransaction = async (id) => {
    try {
        const query = `
            DELETE FROM transactions
            WHERE id = $1
            RETURNING id, user_id, item_id, quantity, total, status, created_at
        `;
        
        const res = await db.query(query, [id]);
        
        if (res.rowCount === 0) {
            console.error("⚠️ Transaction deletion failed: No rows affected.");
            return null;
        }
        
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to delete transaction");
    }
};

exports.getUserTransactions = async (userId) => {
    try {
        const query = `
            SELECT id, user_id, item_id, quantity, total, status, created_at
            FROM transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        
        const res = await db.query(query, [userId]);
        return res.rows;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get user transactions");
    }
};

exports.getItemTransactions = async (itemId) => {
    try {
        const query = `
            SELECT id, user_id, item_id, quantity, total, status, created_at
            FROM transactions
            WHERE item_id = $1
            ORDER BY created_at DESC
        `;
        
        const res = await db.query(query, [itemId]);
        return res.rows;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get item transactions");
    }
};