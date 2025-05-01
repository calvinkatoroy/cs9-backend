const storeRepository = require('../repositories/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllStores = async (req, res) => {
    try {
        const stores = await storeRepository.getAllStores();
        baseResponse(res, true, 200, "Stores found", stores);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving stores", null);
    }
};

exports.createStore = async (req, res) => {
    const { name, address } = req.body;
    
    if (!name || !address) {
        return baseResponse(res, false, 400, "Missing store name or address", null);
    }
    
    try {
        const store = await storeRepository.createStore({ name, address });
        baseResponse(res, true, 201, "Store created", store);
    } catch (error) {
        baseResponse(res, false, 500, "Server Error", null);
    }
};

exports.getStore = async (req, res) => {
    const { id } = req.params;

    try {
        const store = await storeRepository.getStoreById(id);
        if (!store) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store found", store);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving store", null);
    }
};

exports.updateStore = async (req, res) => {
    const { id, name, address } = req.body;

    if (!id || !name || !address) {
        return baseResponse(res, false, 400, "ID, name, and address are required", null);
    }

    try {
        const updatedStore = await storeRepository.updateStore({ id, name, address });
        if (!updatedStore) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store updated", updatedStore);
    } catch (error) {
        baseResponse(res, false, 500, "Error updating store", null);
    }
};

exports.deleteStore = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedStore = await storeRepository.deleteStore(id);
        if (!deletedStore) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store deleted", deletedStore);
    } catch (error) {
        baseResponse(res, false, 500, "Error deleting store", null);
    }
};
