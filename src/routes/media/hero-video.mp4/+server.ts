import type { RequestHandler } from "./$types";

const HERO_VIDEO_KEYS = [
  "hero/hero-video.mp4",
  "media/hero-video.mp4",
  "hero-video.mp4", // Default fallback
] as const;

let resolvedHeroVideoKey: string | undefined;

// ระบบค้นหาว่า Video ของจริงอยู่ที่ Key ไหนในโครงสร้าง R2
async function resolveHeroVideoKey(bucket: R2Bucket) {
  if (resolvedHeroVideoKey) return resolvedHeroVideoKey;

  for (const key of HERO_VIDEO_KEYS) {
    const object = await bucket.head(key);
    if (object) {
      resolvedHeroVideoKey = key;
      return key;
    }
  }
  return null;
}

export const GET: RequestHandler = async ({ platform, request }) => {
  try {
    // 1. ตรวจสอบ Bucket Binding
    const bucket = platform?.env?.VIDEO_BUCKET;
    if (!bucket) {
      // แจ้ง Error ชัดเจนถ้าลืมตั้งค่า Wrangler (กรณีรัน npm run dev เฉยๆ โดยไม่ต่อ proxy)
      return new Response("R2_BUCKET_NOT_CONFIGURED: Please run via 'npm run preview' (wrangler dev) or configure Vite bindings.", { status: 503 });
    }

    // 2. ค้นหาไฟล์ใน R2
    const key = await resolveHeroVideoKey(bucket);
    if (!key) {
      return new Response("Hero video not found in R2 bucket", { status: 404 });
    }

    const rangeHeader = request.headers.get("range");

    // 3. ดึงไฟลจาก R2 พร้อมซัพพอร์ต Range Request
    const object = await bucket.get(key, {
      range: request.headers, // ส่ง Header ไปให้ R2 ตัดสินใจเรื่อง Range อัตโนมัติ (แก้บัค 500)
    });

    if (!object) {
      return new Response("Hero video not found during fetch", { status: 404 });
    }

    // 4. เตรียม Headers สำหรับวิดีโอ (Safari/iOS ต้องการ Accept-Ranges)
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("content-type", "video/mp4");
    headers.set("accept-ranges", "bytes");
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=3600"); // แคช 1 ชั่วโมงกันเหนียว

    // 5. จัดการเรื่อง Partial Content (Range) ตามมาตรฐาน Cloudflare
    let status = 200;
    if (rangeHeader && "body" in object) {
      status = 206;
      if (object.range) {
        // R2 แจ้งค่า Range กลับมาเป็น { offset, length }
        const { offset, length } = object.range as { offset: number; length: number };
        const end = offset + length - 1;
        headers.set("content-range", `bytes ${offset}-${end}/${object.size}`);
        headers.set("content-length", length.toString());
      }
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
