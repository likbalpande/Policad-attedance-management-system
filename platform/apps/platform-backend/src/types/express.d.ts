import type { AccessTokenPayload } from "@platform/types";

declare global {
  namespace Express {
    interface Request {
      // Set by authenticate.middleware.ts after JWT verification.
      user?: AccessTokenPayload;
    }
  }
}

export {};
