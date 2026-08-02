import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@platform/http";

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`No route for ${req.method} ${req.path}`));
}
