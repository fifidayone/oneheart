import { dev } from "$app/environment";
import type { RequestHandler } from "./$types";
import {
  getMediaBucket,
  resolveHeroVideoKey,
} from "$lib/server/hero-media";

function parseRangeHeader(rangeHeader: string | null): R2Range | undefined {
  if (!rangeHeader?.startsWith("bytes=")) {
    return undefined;
  }

  const [rawSpec, ...extraSpecs] = rangeHeader.slice("bytes=".length).split(",");
  if (!rawSpec || extraSpecs.length > 0) {
    return undefined;
  }

  const [startRaw, endRaw] = rawSpec.trim().split("-");
  if (startRaw === undefined || endRaw === undefined) {
    return undefined;
  }

  if (startRaw === "" && endRaw === "") {
    return undefined;
  }

  if (startRaw === "") {
    const suffix = Number(endRaw);
    return Number.isInteger(suffix) && suffix > 0 ? { suffix } : undefined;
  }

  const offset = Number(startRaw);
  if (!Number.isInteger(offset) || offset < 0) {
    return undefined;
  }

  if (endRaw === "") {
    return { offset };
  }

  const end = Number(endRaw);
  if (!Number.isInteger(end) || end < offset) {
    return undefined;
  }

  return { offset, length: end - offset + 1 };
}

export const GET: RequestHandler = async ({ platform, request }) => {
  try {
    // 1. ตรวจสอบ Bucket Binding
    const bucket = getMediaBucket(platform);
    if (!bucket) {
      return new Response("MEDIA_BUCKET_NOT_CONFIGURED: Please run via 'npm run preview' (wrangler dev) or configure the Worker binding.", { status: 503 });
    }

    // 2. ค้นหาไฟล์ใน R2
    const key = await resolveHeroVideoKey(bucket);
    if (!key) {
      return new Response("Hero video not found in R2 bucket", { status: 404 });
    }

    const rangeHeader = request.headers.get("range");
    const parsedRange = parseRangeHeader(rangeHeader);

    // 3. ดึงไฟลจาก R2 พร้อมซัพพอร์ต Range Request
    const object = parsedRange
      ? await bucket.get(key, { range: parsedRange })
      : await bucket.get(key);

    if (!object) {
      return new Response("Hero video not found during fetch", { status: 404 });
    }

    // 4. เตรียม Headers สำหรับวิดีโอ (Safari/iOS ต้องการ Accept-Ranges)
    const headers = new Headers();
    headers.set("content-type", object.httpMetadata?.contentType ?? "video/mp4");
    headers.set("accept-ranges", "bytes");
    headers.set("etag", object.httpEtag);
    
    // Performance: Edge caching with revalidation
    headers.set("cache-control", dev ? "no-store" : "public, max-age=3600, stale-while-revalidate=86400");
    
    // Critical for CDNs when serving partial content
    headers.set("vary", "Range");
    headers.set("x-content-type-options", "nosniff");

    // 5. จัดการเรื่อง Partial Content (Range) ตามมาตรฐาน Cloudflare
    let status = 200;
    if (parsedRange && "body" in object && object.range) {
      status = 206;
      // R2 แจ้งค่า Range กลับมาเป็น { offset, length }
      const { offset, length } = object.range as { offset: number; length: number };
      const end = offset + length - 1;
      headers.set("content-range", `bytes ${offset}-${end}/${object.size}`);
      headers.set("content-length", length.toString());
    } else {
      headers.set("content-length", object.size.toString());
    }

    return new Response("body" in object ? (object as R2ObjectBody).body : null, {
      status,
      headers,
    });
    
  } catch (err: any) {
    console.error("R2 Hero Video Server Error:", err);
    return new Response(`Video Streaming Error: ${err.message}`, { status: 500 });
  }
};
