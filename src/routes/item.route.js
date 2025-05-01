const express = require('express');
const multer = require('multer');
const itemController = require('../controllers/item.controller');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint for creating an item (image is uploaded to Cloudinary)
router.post('/create', upload.single('image'), itemController.createItem);

// Get all items
router.get('/', itemController.getAllItems);

// Get item by ID
router.get('/byId/:id', itemController.getItemById);

// Get items by store ID
router.get('/byStoreId/:store_id', itemController.getItemsByStoreId);

// Update item (supports image update)
router.put('/', upload.single('image'), itemController.updateItem);

// Delete item
router.delete('/:id', itemController.deleteItem);

module.exports = router;