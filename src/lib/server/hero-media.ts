const HERO_VIDEO_KEYS = [
  "hero/hero-video.mp4",
  "media/hero-video.mp4",
  "hero-video.mp4",
] as const;

const HERO_POSTER_KEYS = [
  "hero/hero-poster.avif",
  "media/hero-poster.avif",
  "hero-poster.avif",
] as const;

const resolvedKeyCache = new WeakMap<R2Bucket, Map<string, string | null>>();

async function resolveFirstExistingKey(
  bucket: R2Bucket,
  candidates: readonly string[],
) {
  let bucketCache = resolvedKeyCache.get(bucket);
  if (!bucketCache) {
    bucketCache = new Map<string, string | null>();
    resolvedKeyCache.set(bucket, bucketCache);
  }

  const cacheKey = candidates.join("|");
  if (bucketCache.has(cacheKey)) {
    return bucketCache.get(cacheKey) ?? null;
  }

  for (const key of candidates) {
    const object = await bucket.head(key);
    if (object) {
      bucketCache.set(cacheKey, key);
      return key;
    }
  }

  bucketCache.set(cacheKey, null);
  return null;
}

export function getMediaBucket(platform: App.Platform | undefined) {
  return platform?.env?.MEDIA_BUCKET;
}

export function resolveHeroVideoKey(bucket: R2Bucket) {
  return resolveFirstExistingKey(bucket, HERO_VIDEO_KEYS);
}

export function resolveHeroPosterKey(bucket: R2Bucket) {
  return resolveFirstExistingKey(bucket, HERO_POSTER_KEYS);
}
