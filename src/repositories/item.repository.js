const db = require('../../src/database/pg.database');

exports.createItem = async (itemData) => {
    try {
        const { name, price, stock, store_id, image_url } = itemData;
        
        const query = `
            INSERT INTO items (name, price, stock, store_id, image_url, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `;
        
        const values = [name, price, stock, store_id, image_url];
        
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to create item");
    }
};

exports.getAllItems = async () => {
    try {
        const query = `
            SELECT * FROM items
            ORDER BY created_at DESC
        `;
        
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get all items");
    }
};

exports.getItemById = async (id) => {
    try {
        const query = `
            SELECT id, name, price, stock, store_id, image_url, created_at
            FROM items
            WHERE id = $1
        `;
        
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get item by ID");
    }
};

exports.getItemsByStoreId = async (storeId) => {
    try {
        const query = `
            SELECT * FROM items
            WHERE store_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await db.query(query, [storeId]);
        return result.rows;
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to get items by store ID");
    }
};

exports.updateItem = async (itemData) => {
    try {
        const { id, name, price, stock, store_id, image_url } = itemData;
        
        const query = `
            UPDATE items
            SET name = $1,
                price = $2,
                stock = $3,
                store_id = $4,
                image_url = $5
            WHERE id = $6
            RETURNING *
        `;
        
        const values = [name, price, stock, store_id, image_url, id];
        
        const result = await db.query(query, values);
        
        if (result.rowCount === 0) {
            console.error("⚠️ Item update failed: No rows affected.");
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to update item");
    }
};

exports.updateItemStock = async (id, newStock) => {
    try {
        const query = `
            UPDATE items
            SET stock = $1
            WHERE id = $2
            RETURNING id, name, price, stock, store_id, image_url, created_at
        `;
        
        const result = await db.query(query, [newStock, id]);
        
        if (result.rowCount === 0) {
            console.error("⚠️ Item stock update failed: No rows affected.");
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to update item stock");
    }
};

exports.deleteItem = async (id) => {
    try {
        const query = `
            DELETE FROM items
            WHERE id = $1
            RETURNING id
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rowCount === 0) {
            console.error("⚠️ Item deletion failed: No rows affected.");
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error executing query:", error);
        throw new Error("Database Error: Unable to delete item");
    }
};