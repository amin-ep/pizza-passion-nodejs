export default class AppError extends Error {
  status: string;
  isOperational: boolean;
  constructor(message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this);
  }
}

export class Forbidden extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class Unauthorized extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFound extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class BadRequest extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
