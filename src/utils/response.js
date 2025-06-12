// d:\Project\NodeJS\QuotasMAF02\src\utils\response.js

const SendCreate = (res, statuscode, message, data) => {
    return res.status(201).json({
        success: true,
        statuscode: statuscode || 200,
        message: message || 'Resource created successfully.',
        data: data
    });
};

const SendSuccess = (res, message, data, pagination) => {
    const responseBody = {
        success: true,
        statuscode: 200,
        message: message || 'Request successful.',
        data: data
    };
    if (pagination) {
        responseBody.pagination = pagination;
    }
    return res.status(200).json(responseBody);
};

const SendError400 = (res, message, errorDetails) => {
    return res.status(400).json({
        success: false,
        statuscode: 400,
        message: message || 'Bad Request.',
        errors: errorDetails
    });
};

const SendError = (res, statusCode = 500, message, errorDetails) => {
    return res.status(statusCode).json({
        success: false,
        statuscode: 500,
        message: message || 'An unexpected error occurred.',
        errors: errorDetails
    });
};

const SendDuplicateData = (res, message, errorDetails) => {
    return res.status(409).json({
        success: false,
        statuscode: 409,
        message: message || 'Bad Request.',
        errors: errorDetails
    });
};

module.exports = {
    SendCreate,
    SendSuccess,
    SendError400,
    SendError,
    SendDuplicateData,
    // Export other functions here
};