import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const imagePath = params.path;

	if (!platform?.env) throw error(500, 'Platform environment not found');

	const { FURRY_BUCKET, FURRY_MEDIA } = platform.env;
	const cache =
		typeof caches !== 'undefined'
			? (caches as unknown as CacheStorage & { default: Cache }).default
			: null;
	const cacheKey = new Request(url.toString());

	let response = cache ? await cache.match(cacheKey) : null;

	if (!response) {
		if (!imagePath) throw error(400, 'Missing path');

		const object = await FURRY_BUCKET.get(imagePath);
		if (!object) throw error(404, 'Image not found in R2');

		const width = Number(url.searchParams.get('w')) || 800;

		try {
			const [stream1] = object.body.tee();
			const transformed = await FURRY_MEDIA.input(stream1)
				.transform({
					width: width,
					fit: 'scale-down'
				})
				.output({
					format: 'image/avif'
				});

			if (!transformed) throw new Error('Transformation failed');

			response = new Response(transformed.image(), transformed.response());
			response.headers.set('Cache-Control', 'public, max-age=31536000');

			if (cache && platform.ctx) {
				platform.ctx.waitUntil(cache.put(cacheKey, response.clone()));
			}
		} catch (e) {
			console.error('Transformation Error:', e);
			return new Response(object.body, {
				headers: {
					'Content-Type': object.httpMetadata?.contentType || 'image/webp'
				}
			});
		}
	}

	return response;
};
