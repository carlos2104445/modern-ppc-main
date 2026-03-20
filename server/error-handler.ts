import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const statusCode = (err as any).statusCode || 500;

  console.error(`[${timestamp}] ${method} ${url} - ${statusCode}`);
  console.error(`Error: ${err.message}`);

  if (process.env.NODE_ENV === "development") {
    console.error(`Stack: ${err.stack}`);
    console.error(`Body: ${JSON.stringify(req.body)}`);
  }

  next(err);
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";
  const isOperational = (err as any).isOperational !== false;

  const errorResponse: any = {
    error: message,
    status: statusCode,
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = (err as any).details;
  }

  if (!isOperational) {
    console.error("CRITICAL ERROR - Non-operational error occurred:", err);
    errorResponse.error = "An unexpected error occurred. Please try again later.";
  }

  res.status(statusCode).json(errorResponse);
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
    status: 404,
  });
}
