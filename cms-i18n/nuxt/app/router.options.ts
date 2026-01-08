import type { RouterConfig } from '@nuxt/schema';

// Add a locale-prefixed alias for blog posts so `/es/blog/slug` hits `blog/[slug].vue`.
// Pages continue to use the existing catch-all route; no other locale routes added.
export default <RouterConfig>{
	routes: (_routes) => {
		const newRoutes = [..._routes];

		const blogRoute = _routes.find((r) => r.name === 'blog-slug');

		if (blogRoute && blogRoute.component) {
			newRoutes.unshift({
				path: '/:locale([a-z]{2,3})/blog/:slug',
				name: 'locale-blog-slug',
				component: blogRoute.component,
				meta: blogRoute.meta,
			});
		}

		return newRoutes;
	},
};
