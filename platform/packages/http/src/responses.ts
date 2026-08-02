import type { Response } from "express";

export class ApiSuccessResponse<T = unknown> {
    public readonly success = true as const;

    constructor(public readonly message: string, public readonly data: T) {}

    send(res: Response, statusCode = 200): void {
        res.status(statusCode).json({ success: this.success, message: this.message, data: this.data });
    }
}

export class ApiErrorResponse {
    public readonly success = false as const;

    constructor(
        public readonly message: string,
        public readonly errors?: unknown[],
        public readonly statusCode = 500
    ) {}

    send(res: Response): void {
        res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            ...(this.errors ? { errors: this.errors } : {}),
        });
    }
}
