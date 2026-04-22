import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getMediaBucket: vi.fn(),
	resolveHeroVideoKey: vi.fn()
}));

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$lib/server/hero-media', () => ({
	getMediaBucket: mocks.getMediaBucket,
	resolveHeroVideoKey: mocks.resolveHeroVideoKey
}));

import { GET } from '../routes/media/hero-video.mp4/+server';

describe('GET /media/hero-video.mp4', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 503 when media bucket is not configured', async () => {
		mocks.getMediaBucket.mockReturnValue(undefined);

		const response = await GET({ platform: undefined, request: new Request('http://localhost') } as never);

		expect(response.status).toBe(503);
		expect(await response.text()).toContain('MEDIA_BUCKET_NOT_CONFIGURED');
	});

	it('returns 404 when hero video key cannot be resolved', async () => {
		mocks.getMediaBucket.mockReturnValue({});
		mocks.resolveHeroVideoKey.mockResolvedValue(null);

		const response = await GET({ platform: {} as App.Platform, request: new Request('http://localhost') } as never);

		expect(response.status).toBe(404);
		expect(await response.text()).toContain('Hero video not found in R2 bucket');
	});

	it('returns full response with expected headers', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({
				body: new ReadableStream(),
				size: 1200,
				httpEtag: 'etag-1',
				httpMetadata: { contentType: 'video/mp4' }
			})
		};
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroVideoKey.mockResolvedValue('hero-video.mp4');

		const response = await GET({ platform: {} as App.Platform, request: new Request('http://localhost') } as never);

		expect(response.status).toBe(200);
		expect(bucket.get).toHaveBeenCalledWith('hero-video.mp4');
		expect(response.headers.get('content-type')).toBe('video/mp4');
		expect(response.headers.get('content-length')).toBe('1200');
		expect(response.headers.get('accept-ranges')).toBe('bytes');
		expect(response.headers.get('cache-control')).toBe('public, max-age=3600, stale-while-revalidate=86400');
	});

	it('returns partial content when range header is valid', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({
				body: new ReadableStream(),
				size: 1000,
				httpEtag: 'etag-2',
				httpMetadata: { contentType: 'video/mp4' },
				range: { offset: 100, length: 200 }
			})
		};
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroVideoKey.mockResolvedValue('hero-video.mp4');

		const request = new Request('http://localhost', { headers: { range: 'bytes=100-299' } });
		const response = await GET({ platform: {} as App.Platform, request } as never);

		expect(bucket.get).toHaveBeenCalledWith('hero-video.mp4', { range: { offset: 100, length: 200 } });
		expect(response.status).toBe(206);
		expect(response.headers.get('content-range')).toBe('bytes 100-299/1000');
		expect(response.headers.get('content-length')).toBe('200');
	});

	it('ignores invalid range headers', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({
				body: new ReadableStream(),
				size: 1000,
				httpEtag: 'etag-3',
				httpMetadata: { contentType: 'video/mp4' }
			})
		};
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroVideoKey.mockResolvedValue('hero-video.mp4');

		const request = new Request('http://localhost', { headers: { range: 'bytes=100-200,300-400' } });
		const response = await GET({ platform: {} as App.Platform, request } as never);

		expect(bucket.get).toHaveBeenCalledWith('hero-video.mp4');
		expect(response.status).toBe(200);
	});

	it('returns 500 when underlying bucket call throws', async () => {
		const bucket = {
			get: vi.fn().mockRejectedValue(new Error('boom'))
		};
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroVideoKey.mockResolvedValue('hero-video.mp4');

		const response = await GET({ platform: {} as App.Platform, request: new Request('http://localhost') } as never);

		expect(response.status).toBe(500);
		expect(await response.text()).toContain('Video Streaming Error: boom');
	});
});
