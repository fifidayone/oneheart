import type { RequestHandler } from "./$types";
import {
  getMediaBucket,
  resolveHeroPosterKey,
} from "$lib/server/hero-media";

export const GET: RequestHandler = async ({ platform }) => {
  try {
    const bucket = getMediaBucket(platform);
    if (!bucket) {
      return new Response("MEDIA_BUCKET_NOT_CONFIGURED: Please run via 'npm run preview' (wrangler dev) or configure the Worker binding.", { status: 503 });
    }

    const key = await resolveHeroPosterKey(bucket);
    if (!key) {
      return new Response("Hero poster not found in R2 bucket", { status: 404 });
    }

    const object = await bucket.get(key);
    if (!object || !("body" in object)) {
      return new Response("Hero poster not found during fetch", { status: 404 });
    }

    const headers = new Headers();
    headers.set("content-type", object.httpMetadata?.contentType ?? "image/avif");
    headers.set("cache-control", "public, max-age=3600");
    headers.set("etag", object.httpEtag);
    headers.set("content-length", object.size.toString());

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("R2 Hero Poster Server Error:", err);
    return new Response(`Poster Streaming Error: ${err.message}`, { status: 500 });
  }
};
