const itemRepository = require('../repositories/item.repository');
const cloudinary = require('../config/cloudinary');
const { streamUpload } = require('../utils/streamUpload');

exports.createItem = async (req, res) => {
    try {
        const { name, price, stock, store_id } = req.body;
        
        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (req.file) {
            const result = await streamUpload(req.file.buffer);
            imageUrl = result.secure_url;
        }
        
        const newItem = await itemRepository.createItem({
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            store_id: String(store_id).trim(),
            image_url: imageUrl
        });
        
        res.status(201).json({
            status: 'success',
            data: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create item',
            error: error.message
        });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const items = await itemRepository.getAllItems();
        
        res.status(200).json({
            status: 'success',
            data: items
        });
    } catch (error) {
        console.error('Error getting all items:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve items',
            error: error.message
        });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const id = String(req.params.id).trim();
        const item = await itemRepository.getItemById(id);
        
        if (!item) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: item
        });
    } catch (error) {
        console.error('Error getting item by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve item',
            error: error.message
        });
    }
};

exports.getItemsByStoreId = async (req, res) => {
    try {
        const storeId = String(req.params.store_id).trim();
        const items = await itemRepository.getItemsByStoreId(storeId);
        
        res.status(200).json({
            status: 'success',
            data: items
        });
    } catch (error) {
        console.error('Error getting items by store ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve items',
            error: error.message
        });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id, name, price, stock, store_id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'Item ID is required'
            });
        }
        
        // Check if item exists
        const existingItem = await itemRepository.getItemById(String(id).trim());
        if (!existingItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found'
            });
        }
        
        // Upload new image if provided
        let imageUrl = existingItem.image_url;
        if (req.file) {
            const result = await streamUpload(req.file.buffer);
            imageUrl = result.secure_url;
        }
        
        const updatedItem = await itemRepository.updateItem({
            id: String(id).trim(),
            name: name || existingItem.name,
            price: price ? parseFloat(price) : existingItem.price,
            stock: stock ? parseInt(stock) : existingItem.stock,
            store_id: store_id ? String(store_id).trim() : existingItem.store_id,
            image_url: imageUrl
        });
        
        res.status(200).json({
            status: 'success',
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update item',
            error: error.message
        });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const id = String(req.params.id).trim();
        
        // Check if item exists
        const existingItem = await itemRepository.getItemById(id);
        if (!existingItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found'
            });
        }
        
        const deletedItem = await itemRepository.deleteItem(id);
        
        if (!deletedItem) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to delete item'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete item',
            error: error.message
        });
    }
};