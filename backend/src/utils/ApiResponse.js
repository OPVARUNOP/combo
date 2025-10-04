/**
 * Utility class for standardizing API responses
 */
class ApiResponse {
  /**
   * Create a new ApiResponse instance
   * @param {Object} res - Express response object
   */
  constructor(res) {
    this.res = res;
  }

  /**
   * Send a success response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} [statusCode=200] - HTTP status code
   */
  success(data = null, message = 'Operation successful', statusCode = 200) {
    this.res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  /**
   * Send a created response (201)
   * @param {Object} data - Created resource data
   * @param {string} message - Success message
   */
  created(data, message = 'Resource created successfully') {
    this.success(data, message, 201);
  }

  /**
   * Send a no content response (204)
   */
  noContent() {
    this.res.status(204).end();
  }

  /**
   * Send a bad request error response (400)
   * @param {string} message - Error message
   * @param {Array} [errors=[]] - Validation errors
   */
  badRequest(message = 'Bad Request', errors = []) {
    this.error(message, 400, errors);
  }

  /**
   * Send an unauthorized error response (401)
   * @param {string} message - Error message
   */
  unauthorized(message = 'Unauthorized') {
    this.error(message, 401);
  }

  /**
   * Send a forbidden error response (403)
   * @param {string} message - Error message
   */
  forbidden(message = 'Forbidden') {
    this.error(message, 403);
  }

  /**
   * Send a not found error response (404)
   * @param {string} message - Error message
   */
  notFound(message = 'Resource not found') {
    this.error(message, 404);
  }

  /**
   * Send a conflict error response (409)
   * @param {string} message - Error message
   */
  conflict(message = 'Resource already exists') {
    this.error(message, 409);
  }

  /**
   * Send a validation error response (422)
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  validationError(errors, message = 'Validation failed') {
    this.error(message, 422, errors);
  }

  /**
   * Send a server error response (500)
   * @param {string} message - Error message
   */
  serverError(message = 'Internal Server Error') {
    this.error(message, 500);
  }

  /**
   * Send a custom error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} [errors=[]] - Additional error details
   */
  error(message, statusCode = 400, errors = []) {
    const response = {
      status: 'error',
      message,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    this.res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
