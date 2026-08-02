import "dotenv/config";
import { z } from "zod";

// PEM keys are stored as a single .env line with literal "\n" escapes.
const pemKey = z
    .string()
    .min(1)
    .transform((value) => value.replace(/\\n/g, "\n"));

const envSchema = z.object({
    // Single .env for both environments - this is the identifier, not
    // separate .env.development / .env.production files.
    APP_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().min(1),

    // Private key 1 / public key 1 - signs/verifies the access + refresh JWTs.
    JWT_ACCESS_PRIVATE_KEY: pemKey,
    JWT_ACCESS_PUBLIC_KEY: pemKey,
    // Private key 2 / public key 2 - signs/verifies the UAI-derived "origin" hash
    // embedded in the JWT payload. Public key 2 gets served to LAG later.
    ORIGIN_SIGN_PRIVATE_KEY: pemKey,
    ORIGIN_SIGN_PUBLIC_KEY: pemKey,

    OTP_TTL_SECONDS: z.coerce.number().default(300),
    STAFF_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(15 * 60),
    STAFF_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(7 * 24 * 60 * 60),
    // Longer-lived than staff tokens by design - see product-idea.txt's
    // student login section.
    STUDENT_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(24 * 60 * 60),
    STUDENT_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(31 * 24 * 60 * 60),

    // Optional - unset means traces print to stdout via a console exporter
    // (see @platform/tracing). Point at any OTLP-compatible collector/backend
    // once one exists.
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
