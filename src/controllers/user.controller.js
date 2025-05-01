const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcrypt');
const NAME_REGEX = /^[a-zA-Z\s]{3,50}$/;  // 3-50 chars, letters and spaces only
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Standard email format
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Min 8 chars, with uppercase, lowercase, number, special char

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userRepository.getAllUsers();
        baseResponse(res, true, 200, "Users found", users);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving users", null);
    }
};

exports.registerUser = async (req, res) => {
    // Get data from either query parameters or request body
    const name = req.query.name || req.body.name;
    const email = req.query.email || req.body.email;
    const password = req.query.password || req.body.password;
    const balance = req.query.balance || req.body.balance || 0;

    if (!name || !email || !password) {
        return baseResponse(res, false, 400, "Missing name, email, or password", null);
    }
    
    // Regex validation
    if (!NAME_REGEX.test(name)) {
        return baseResponse(res, false, 400, "Name must be 3-50 characters and contain only letters and spaces", null);
    }
    
    if (!EMAIL_REGEX.test(email)) {
        return baseResponse(res, false, 400, "Invalid email format", null);
    }
    
    if (!PASSWORD_REGEX.test(password)) {
        return baseResponse(res, false, 400, "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character", null);
    }

    try {
        // Check if email already exists
        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            return baseResponse(res, false, 400, "Email already used", null);
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userRepository.registerUser({ name, email, password: hashedPassword, balance });

        return baseResponse(res, true, 201, "User created", user);
    } catch (error) {
        console.error("Registration error:", error);
        return baseResponse(res, false, 500, "Server Error", null);
    }
};

exports.loginUser = async (req, res) => {
    // Get data from query parameters
    const email = req.query.email || req.body.email;
    const password = req.query.password || req.body.password;

    if (!email || !password) {
        return baseResponse(res, false, 400, "Missing email or password", null);
    }

    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }

        return baseResponse(res, true, 200, "Login success", user);
    } catch (error) {
        console.error("Login error:", error);
        return baseResponse(res, false, 500, "Error during login", null);
    }
};

exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        
        return baseResponse(res, true, 200, "User found", {
            id: user.id,
            name: user.name,
            email: user.email,
            balance: user.balance
        });
    } catch (error) {
        console.error("Get user error:", error);
        return baseResponse(res, false, 500, "Error retrieving user", null);
    }
};

exports.updateUser = async (req, res) => {
    // Get data from either query parameters or request body
    const id = req.query.id || req.body.id;
    const name = req.query.name || req.body.name;
    const email = req.query.email || req.body.email;
    const password = req.query.password || req.body.password;
    const balance = req.query.balance !== undefined ? req.query.balance : 
                   (req.body.balance !== undefined ? req.body.balance : undefined);

    if (!id) {
        return baseResponse(res, false, 400, "User ID is required", null);
    }

    try {
        // Get the existing user data
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            return baseResponse(res, false, 404, "User not found", null);
        }

        // Validate fields if provided
        if (name && !NAME_REGEX.test(name)) {
            return baseResponse(res, false, 400, "Name must be 3-50 characters and contain only letters and spaces", null);
        }
        
        if (email && !EMAIL_REGEX.test(email)) {
            return baseResponse(res, false, 400, "Invalid email format", null);
        }
        
        if (password && !PASSWORD_REGEX.test(password)) {
            return baseResponse(res, false, 400, "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character", null);
        }

        // Prepare updated user data
        const updateData = {
            id,
            name: name || existingUser.name,
            email: email || existingUser.email,
            password: password ? await bcrypt.hash(password, 10) : existingUser.password,
            balance: balance !== undefined ? balance : existingUser.balance
        };

        // Execute update
        const updatedUser = await userRepository.updateUser(updateData);
        if (!updatedUser) {
            return baseResponse(res, false, 500, "User update failed", null);
        }

        return baseResponse(res, true, 200, "User updated", updatedUser);
    } catch (error) {
        if (error.code === '23505') {
            return baseResponse(res, false, 400, "Email already in use", null);
        }

        console.error("❌ Update user error:", error);
        return baseResponse(res, false, 500, "Error updating user", null);
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return baseResponse(res, false, 400, "User ID is required", null);
    }

    try {
        const deletedUser = await userRepository.deleteUser(id);
        if (!deletedUser) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        
        return baseResponse(res, true, 200, "User deleted", {
            id: deletedUser.id,
            name: deletedUser.name,
            email: deletedUser.email
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return baseResponse(res, false, 500, "Error deleting user", null);
    }
};

exports.topUpUser = async (req, res) => {
    // Get data from query parameters
    const id = req.query.id;
    const amount = parseFloat(req.query.amount);

    if (!id) {
        return baseResponse(res, false, 400, "User ID is required", null);
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        return baseResponse(res, false, 400, "Amount must be larger than 0", null);
    }

    try {
        // Get the existing user
        const user = await userRepository.getUserById(id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }

        // Calculate new balance
        const newBalance = user.balance + amount;

        // Update user with new balance
        const updateData = {
            id,
            name: user.name,
            email: user.email,
            password: user.password,
            balance: newBalance
        };

        const updatedUser = await userRepository.updateUser(updateData);
        if (!updatedUser) {
            return baseResponse(res, false, 500, "Top up failed", null);
        }

        return baseResponse(res, true, 200, "Top up successful", updatedUser);
    } catch (error) {
        console.error("❌ Top up error:", error);
        return baseResponse(res, false, 500, "Error during top up", null);
    }
};