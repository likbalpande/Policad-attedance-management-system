import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";
import { ApiErrorResponse } from "./responses";

// Registered once in each app's app.ts, after all routers.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    new ApiErrorResponse(err.message, err.errors, err.statusCode).send(res);
    return;
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  new ApiErrorResponse(message, undefined, 500).send(res);
}
