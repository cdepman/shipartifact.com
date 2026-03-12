import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadSiteToR2(
  slug: string,
  html: string
): Promise<void> {
  const r2 = getR2Client();

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `sites/${slug}/index.html`,
      Body: html,
      ContentType: "text/html; charset=utf-8",
      CacheControl: "public, max-age=60",
    })
  );
}

export async function deleteSiteFromR2(slug: string): Promise<void> {
  const r2 = getR2Client();

  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `sites/${slug}/index.html`,
    })
  );
}
