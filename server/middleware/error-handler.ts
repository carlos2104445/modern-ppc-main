import type { Request, Response, NextFunction } from "express";
import { AppError, createApiError, ErrorCode } from "../errors";
import { ZodError } from "zod";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    const apiError = createApiError(err.code, err.message, req.path, err.details);

    return res.status(err.statusCode).json(apiError);
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
      code: e.code,
    }));

    const apiError = createApiError(ErrorCode.VALIDATION_ERROR, "Validation failed", req.path, {
      errors: details,
    });

    return res.status(400).json(apiError);
  }

  console.error("Unhandled error:", err);

  const apiError = createApiError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
    req.path,
    process.env.NODE_ENV === "production" ? undefined : { stack: err.stack }
  );

  return res.status(500).json(apiError);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
