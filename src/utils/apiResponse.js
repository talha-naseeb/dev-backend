class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode >= 200 && statusCode < 300;
  }

  static success(message, data, statusCode = 200) {
    return new ApiResponse(statusCode, message, data);
  }

  static created(message, data) {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = "No Content") {
    return new ApiResponse(204, message);
  }

  static send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = ApiResponse;
