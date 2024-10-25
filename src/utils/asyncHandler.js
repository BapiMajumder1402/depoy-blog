import { ApiError } from "./apiErrorHandler.js";

export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    errors: error.errors,
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    };
};
