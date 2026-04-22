import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMediaBucket = vi.fn();
const resolveHeroPosterKey = vi.fn();

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$lib/server/hero-media', () => ({
	getMediaBucket,
	resolveHeroPosterKey
}));

import { GET } from './+server';

describe('GET /media/hero-poster.avif', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 503 when media bucket is not configured', async () => {
		getMediaBucket.mockReturnValue(undefined);

		const response = await GET({ platform: undefined } as never);

		expect(response.status).toBe(503);
		expect(await response.text()).toContain('MEDIA_BUCKET_NOT_CONFIGURED');
	});

	it('returns 404 when hero poster key cannot be resolved', async () => {
		getMediaBucket.mockReturnValue({});
		resolveHeroPosterKey.mockResolvedValue(null);

		const response = await GET({ platform: {} as App.Platform } as never);

		expect(response.status).toBe(404);
		expect(await response.text()).toContain('Hero poster not found in R2 bucket');
	});

	it('returns 404 when fetched object does not have a body', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({ size: 120, httpEtag: 'etag' })
		};
		getMediaBucket.mockReturnValue(bucket);
		resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET({ platform: {} as App.Platform } as never);

		expect(bucket.get).toHaveBeenCalledWith('hero-poster.avif');
		expect(response.status).toBe(404);
		expect(await response.text()).toContain('Hero poster not found during fetch');
	});

	it('returns image response with expected headers', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({
				body: new ReadableStream(),
				size: 1500,
				httpEtag: 'etag-1',
				httpMetadata: { contentType: 'image/avif' }
			})
		};
		getMediaBucket.mockReturnValue(bucket);
		resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET({ platform: {} as App.Platform } as never);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('image/avif');
		expect(response.headers.get('cache-control')).toBe('public, max-age=3600, stale-while-revalidate=86400');
		expect(response.headers.get('vary')).toBe('Accept');
		expect(response.headers.get('etag')).toBe('etag-1');
		expect(response.headers.get('content-length')).toBe('1500');
	});

	it('returns 500 when poster fetching throws', async () => {
		const bucket = {
			get: vi.fn().mockRejectedValue(new Error('poster boom'))
		};
		getMediaBucket.mockReturnValue(bucket);
		resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET({ platform: {} as App.Platform } as never);

		expect(response.status).toBe(500);
		expect(await response.text()).toContain('Poster Streaming Error: poster boom');
	});
});
