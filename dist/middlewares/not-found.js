import { StatusCodes } from "http-status-codes";
export function notFoundHandler(request, response) {
    response.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Route not found: ${request.method} ${request.originalUrl}`,
    });
}
