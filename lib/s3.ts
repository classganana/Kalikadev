/**
 * S3 uploads for product images. Configure AWS_* + AWS_S3_BUCKET_NAME in env.
 * When not fully configured, the upload API falls back to local public/uploads/.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getClient(): S3Client {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  return new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}

/**
 * True when S3 bucket + region are set. Credentials optional:
 * - Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (e.g. local dev), or
 * - On EC2, omit keys and attach an IAM role to the instance with s3:PutObject on uploads/*
 */
export function isS3UploadEnabled(): boolean {
  return Boolean(
    process.env.AWS_S3_BUCKET_NAME?.trim() && process.env.AWS_REGION?.trim()
  );
}

/**
 * Public URL for an object key. Prefer AWS_S3_PUBLIC_URL_BASE for CloudFront
 * or a custom domain; otherwise virtual-hosted–style S3 URL.
 */
export function publicUrlForS3Key(key: string): string {
  const base = process.env.AWS_S3_PUBLIC_URL_BASE?.replace(/\/$/, "").trim();
  if (base) {
    return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
  const bucket = process.env.AWS_S3_BUCKET_NAME!.trim();
  const region = process.env.AWS_REGION!.trim();
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
}

export async function uploadBufferToS3(params: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET_NAME!.trim();
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.buffer,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrlForS3Key(params.key);
}
