import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { getCurrentDealer } from "@/lib/db/dealer";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES_PER_REQUEST = 12;

/**
 * Returns short-lived, pre-signed PUT URLs the browser can upload directly
 * to R2 with — the file bytes never pass through our server. Scoped to the
 * signed-in dealer so uploads land under a per-dealer folder in the bucket.
 */
export async function POST(request: Request) {
  const { dealer } = await getCurrentDealer();
  const body = await request.json();
  const files: { name: string; type: string }[] = Array.isArray(body.files)
    ? body.files
    : [];

  if (files.length === 0 || files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Send between 1 and ${MAX_FILES_PER_REQUEST} files.` },
      { status: 400 },
    );
  }

  const uploads = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `${dealer.id}/${crypto.randomUUID()}.${ext}`;

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: file.type,
      }),
      { expiresIn: 60 * 5 },
    );

    uploads.push({ uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` });
  }

  return NextResponse.json({ uploads });
}
