const sendResponse = (res, statusCode, message, success, data = null) => {
    res.status(statusCode).send({
        message,
        success,
        data
    });
};

module.exports = { sendResponse };