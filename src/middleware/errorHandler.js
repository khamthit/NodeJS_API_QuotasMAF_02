// d:\Project\NodeJS\QuotasMAF02\src\middleware\errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    const statusCode = err.statusCode || 500; // Default to 500 if no status code is set
    const message = err.message || 'Something went wrong on the server!';

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Optionally, you might want to send the stack trace in development
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;