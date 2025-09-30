class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(data, message = 'Success', statusCode = 200) {
    return this.res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  error(message = 'An error occurred', statusCode = 400, errors = null) {
    const response = {
      status: 'error',
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return this.res.status(statusCode).json(response);
  }

  notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401);
  }

  forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }
}

module.exports = ApiResponse;
