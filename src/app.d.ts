// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: {
				FURRY_BUCKET: R2Bucket;
				FURRY_MEDIA: ImagesBinding;
			};
			ctx: ExecutionContext;
			caches: CacheStorage & { default: Cache };
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
