/**
 * POST /api/admin/upload - Upload product image (admin only).
 * Uses S3 when AWS_* + AWS_S3_BUCKET_NAME are set; otherwise saves to public/uploads/.
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { isS3UploadEnabled, uploadBufferToS3 } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** Extension from MIME only — original filename is never used in stored object names. */
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function extensionForMime(mime: string): string {
  return EXT_BY_MIME[mime] ?? ".jpg";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = extensionForMime(file.type);
    const safeName = `${randomUUID()}${ext}`;
    const key = path.posix.join("uploads", safeName);

    if (isS3UploadEnabled()) {
      const url = await uploadBufferToS3({
        key,
        buffer,
        contentType: file.type || "application/octet-stream",
      });
      return NextResponse.json({ url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, safeName);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    const url = `/uploads/${safeName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
