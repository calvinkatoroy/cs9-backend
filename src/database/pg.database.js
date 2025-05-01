// src/database/pg.database.js
require("dotenv").config();
const { Pool } = require("pg");

// Create pool with configuration
const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false // Required for NeonDB
    },
    max: 5, // Reduced number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000 // Increased timeout
});

// Flag to track connection status
let isConnected = false;

// Connect function with conditional execution
const connect = async () => {
    // Skip connection check if disabled via env var
    if (process.env.ENABLE_DB_STARTUP_CHECK === 'false') {
        console.log("⚠️ Database startup check disabled - skipping initial connection");
        return;
    }

    try {
        // Use a simple query with timeout
        const res = await Promise.race([
            pool.query('SELECT 1'),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            )
        ]);
        
        isConnected = true;
        console.log("✅ Connected to the database");
    } catch (error) {
        isConnected = false;
        console.error("❌ Error connecting to the database", error);
        // Log error but don't throw - let app continue starting
    }
};

// Initialize connection attempt (but don't wait for it)
connect();

// Query function with connection check
const query = async (text, params) => {
    try {
        // If not connected, try to connect first
        if (!isConnected && process.env.ENABLE_DB_STARTUP_CHECK !== 'false') {
            await connect();
        }
        
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error("❌ Error executing query", error);
        throw error; // Rethrow for handling at controller level
    }
};

module.exports = { 
    query,
    pool,
    isConnected: () => isConnected
};