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

const resolvedHeroMediaKeys = new Map<string, string>();

async function resolveFirstExistingKey(
  bucket: R2Bucket,
  cacheKey: string,
  candidates: readonly string[],
) {
  const cachedKey = resolvedHeroMediaKeys.get(cacheKey);
  if (cachedKey) {
    return cachedKey;
  }

  for (const key of candidates) {
    const object = await bucket.head(key);
    if (object) {
      resolvedHeroMediaKeys.set(cacheKey, key);
      return key;
    }
  }

  return null;
}

export function getMediaBucket(platform: App.Platform | undefined) {
  return platform?.env?.MEDIA_BUCKET;
}

export function resolveHeroVideoKey(bucket: R2Bucket) {
  return resolveFirstExistingKey(bucket, "hero-video", HERO_VIDEO_KEYS);
}

export function resolveHeroPosterKey(bucket: R2Bucket) {
  return resolveFirstExistingKey(bucket, "hero-poster", HERO_POSTER_KEYS);
}
