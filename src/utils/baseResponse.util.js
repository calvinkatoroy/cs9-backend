const baseResponse = (res, success, status, message, payload) => {
    return res.status(status).json({
        success, // sebelumnya `succes`
        message,
        payload
    });
};

module.exports = baseResponse;
