const db = require("../database/pg.database");

exports.getAllUsers = async () => {
    try {
        const res = await db.query("SELECT * FROM users");
        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        return null;
    }
};

exports.registerUser = async (user) => {
    try {
        const res = await db.query(
            "INSERT INTO users (name, email, password, balance) VALUES ($1, $2, $3, $4) RETURNING id, name, email, balance, created_at",
            [user.name, user.email, user.password, user.balance || 0]
        );

        if (res.rowCount === 0) {
            console.error("⚠️ User registration failed: No rows affected.");
            return null;
        }

        console.log("✅ User successfully registered:", res.rows[0]);
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to register user");
    }
};

exports.getUserByEmail = async (email) => {
    try {
        const res = await db.query("SELECT id, name, email, password, balance, created_at FROM users WHERE email = $1", [email]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get user by email");
    }
};

exports.getUserById = async (id) => {
    try {
        const res = await db.query("SELECT id, name, email, password, balance, created_at FROM users WHERE id = $1", [id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get user by ID");
    }
};

exports.updateUser = async (user) => {
    try {
        const res = await db.query(
            "UPDATE users SET name = $1, email = $2, password = $3, balance = $4 WHERE id = $5 RETURNING id, name, email, balance, created_at",
            [user.name, user.email, user.password, user.balance, user.id]
        );
        
        if (res.rowCount === 0) {
            console.error("⚠️ User update failed: No rows affected.");
            return null;
        }
        
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to update user");
    }
};

exports.deleteUser = async (id) => {
    try {
        const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING id, name, email, balance, created_at", [id]);
        
        if (res.rowCount === 0) {
            console.error("⚠️ User deletion failed: No rows affected.");
            return null;
        }
        
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to delete user");
    }
};

exports.updateUserBalance = async (id, newBalance) => {
    try {
        const query = `
            UPDATE users
            SET balance = $1
            WHERE id = $2
            RETURNING id, name, email, balance, created_at
        `;
        
        const res = await db.query(query, [newBalance, id]);
        
        if (res.rowCount === 0) {
            console.error("⚠️ User balance update failed: No rows affected.");
            return null;
        }
        
        return res.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to update user balance");
    }
};