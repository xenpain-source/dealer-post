import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 speaks the S3 API, so the regular AWS SDK works against it —
// just point it at R2's account-specific endpoint instead of AWS.
const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is not set. See .env.example.`);
  }
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
