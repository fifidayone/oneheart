import { describe, expect, it, vi } from 'vitest';
import { getMediaBucket, resolveHeroPosterKey, resolveHeroVideoKey } from './hero-media';

function createBucket(existingKeys: Set<string>) {
	return {
		head: vi.fn(async (key: string) => (existingKeys.has(key) ? { key } : null))
	};
}

describe('hero-media', () => {
	it('returns media bucket from platform', () => {
		const bucket = {};
		expect(getMediaBucket({ env: { MEDIA_BUCKET: bucket } } as App.Platform)).toBe(bucket);
		expect(getMediaBucket(undefined)).toBeUndefined();
	});

	it('resolves first existing video key and caches positive lookups', async () => {
		const bucket = createBucket(new Set(['media/hero-video.mp4']));

		await expect(resolveHeroVideoKey(bucket)).resolves.toBe('media/hero-video.mp4');
		await expect(resolveHeroVideoKey(bucket)).resolves.toBe('media/hero-video.mp4');

		expect(bucket.head).toHaveBeenCalledTimes(2);
		expect(bucket.head).toHaveBeenNthCalledWith(1, 'hero/hero-video.mp4');
		expect(bucket.head).toHaveBeenNthCalledWith(2, 'media/hero-video.mp4');
	});

	it('caches miss results and does not re-check keys for same bucket', async () => {
		const bucket = createBucket(new Set());

		await expect(resolveHeroPosterKey(bucket)).resolves.toBeNull();
		await expect(resolveHeroPosterKey(bucket)).resolves.toBeNull();

		expect(bucket.head).toHaveBeenCalledTimes(3);
		expect(bucket.head).toHaveBeenNthCalledWith(1, 'hero/hero-poster.avif');
		expect(bucket.head).toHaveBeenNthCalledWith(2, 'media/hero-poster.avif');
		expect(bucket.head).toHaveBeenNthCalledWith(3, 'hero-poster.avif');
	});

	it('keeps cache isolated per bucket instance', async () => {
		const firstBucket = createBucket(new Set(['hero-video.mp4']));
		const secondBucket = createBucket(new Set(['hero/hero-video.mp4']));

		await expect(resolveHeroVideoKey(firstBucket)).resolves.toBe('hero-video.mp4');
		await expect(resolveHeroVideoKey(secondBucket)).resolves.toBe('hero/hero-video.mp4');

		expect(firstBucket.head).toHaveBeenCalledTimes(3);
		expect(secondBucket.head).toHaveBeenCalledTimes(1);
	});
});
