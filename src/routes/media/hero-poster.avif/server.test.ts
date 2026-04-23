import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getMediaBucket: vi.fn(),
	resolveHeroPosterKey: vi.fn()
}));

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$lib/server/hero-media', () => ({
	getMediaBucket: mocks.getMediaBucket,
	resolveHeroPosterKey: mocks.resolveHeroPosterKey
}));

import { GET } from './+server';

type GetEvent = Parameters<typeof GET>[0];

function createEvent(overrides: Partial<GetEvent> = {}): GetEvent {
	const request = overrides.request ?? new Request('http://localhost');
	return {
		cookies: { get: vi.fn(), getAll: vi.fn(() => []), set: vi.fn(), delete: vi.fn(), serialize: vi.fn(() => '') },
		fetch: globalThis.fetch,
		getClientAddress: () => '127.0.0.1',
		locals: {},
		params: {},
		platform: undefined,
		request,
		route: { id: '/media/hero-poster.avif' },
		setHeaders: vi.fn(),
		url: new URL(request.url),
		isDataRequest: false,
		isSubRequest: false,
		...overrides
	} as GetEvent;
}

describe('GET /media/hero-poster.avif', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 503 when media bucket is not configured', async () => {
		mocks.getMediaBucket.mockReturnValue(undefined);

		const response = await GET(createEvent({ platform: undefined }));

		expect(response.status).toBe(503);
		expect(await response.text()).toContain('MEDIA_BUCKET_NOT_CONFIGURED');
	});

	it('returns 404 when hero poster key cannot be resolved', async () => {
		mocks.getMediaBucket.mockReturnValue({});
		mocks.resolveHeroPosterKey.mockResolvedValue(null);

		const response = await GET(createEvent({ platform: {} as App.Platform }));

		expect(response.status).toBe(404);
		expect(await response.text()).toContain('Hero poster not found in R2 bucket');
	});

	it('returns 404 when fetched object does not have a body', async () => {
		const bucket = {
			get: vi.fn().mockResolvedValue({ size: 120, httpEtag: 'etag' })
		};
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET(createEvent({ platform: {} as App.Platform }));

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
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET(createEvent({ platform: {} as App.Platform }));

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
		mocks.getMediaBucket.mockReturnValue(bucket);
		mocks.resolveHeroPosterKey.mockResolvedValue('hero-poster.avif');

		const response = await GET(createEvent({ platform: {} as App.Platform }));

		expect(response.status).toBe(500);
		expect(await response.text()).toContain('Poster Streaming Error: poster boom');
	});
});
