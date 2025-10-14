import type { QueryFilter } from '@directus/sdk';
import { useDirectus } from './directus';
import type { BlockPost, Page, PageBlock, Post, Schema, DirectusUser } from '@/types/directus-schema';

const { directus, readItems, readItem, readSingleton, aggregate, withToken } = useDirectus();

/**
 * Page fields configuration for Directus queries
 *
 * This defines the complete field structure for pages including:
 * - Basic page metadata (title, id)
 * - SEO fields for search engine optimization
 * - Complex nested content blocks (hero, gallery, pricing, forms, etc.)
 * - All nested relationships and dynamic content fields
 */
const pageFields = [
  'title',
  'seo',
  'id',
  {
    blocks: [
      'id',
      'background',
      'collection',
      'item',
      'sort',
      'hide_block',
      {
        item: {
          block_richtext: ['id', 'tagline', 'headline', 'content', 'alignment'],
          block_gallery: ['id', 'tagline', 'headline', { items: ['id', 'directus_file', 'sort'] as any }],
          block_pricing: [
            'id',
            'tagline',
            'headline',
            {
              pricing_cards: [
                'id',
                'title',
                'description',
                'price',
                'badge',
                'features',
                'is_highlighted',
                {
                  button: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
                },
              ],
            },
          ],
          block_hero: [
            'id',
            'tagline',
            'headline',
            'description',
            'layout',
            'image',
            {
              button_group: [
                'id',
                {
                  buttons: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
                },
              ],
            },
          ],
          block_posts: ['id', 'tagline', 'headline', 'collection', 'limit'],
          block_form: [
            'id',
            'tagline',
            'headline',
            {
              form: [
                'id',
                'title',
                'submit_label',
                'success_message',
                'on_success',
                'success_redirect_url',
                'is_active',
                {
                  fields: [
                    'id',
                    'name',
                    'type',
                    'label',
                    'placeholder',
                    'help',
                    'validation',
                    'width',
                    'choices',
                    'required',
                    'sort',
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
] as const;

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (
  permalink: string,
  postPage = 1,
  token?: string,
  preview?: boolean,
): Promise<Page> => {
  try {
    const pageData = (await directus.request(
      withToken(
        token as string,
        readItems('pages', {
          filter:
            preview && token
              ? { permalink: { _eq: permalink } }
              : { permalink: { _eq: permalink }, status: { _eq: 'published' } },
          limit: 1,
          fields: pageFields,
          deep: {
            blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
          },
        }),
      ),
    )) as Page[];

    if (!pageData.length) {
      throw new Error('Page not found');
    }

    const page = pageData[0];

    // Dynamic Content Enhancement:
    // Some blocks need additional data fetched at runtime
    // This is where we enhance static block data with dynamic content
    if (Array.isArray(page.blocks)) {
      for (const block of page.blocks as PageBlock[]) {
        // Handle dynamic posts blocks - these blocks display a list of posts
        // The posts are fetched dynamically based on the block's configuration
        if (
          block.collection === 'block_posts' &&
          block.item &&
          typeof block.item !== 'string' &&
          'collection' in block.item &&
          block.item.collection === 'posts'
        ) {
          const blockPost = block.item as BlockPost;
          const limit = blockPost.limit ?? 6; // Default to 6 posts if no limit specified

          // Fetch the actual posts data for this block
          // Always fetch published posts only (no preview mode for dynamic content)
          const posts = await directus.request<Post[]>(
            readItems('posts', {
              fields: ['id', 'title', 'description', 'slug', 'image', 'status', 'published_at'],
              filter: { status: { _eq: 'published' } },
              sort: ['-published_at'],
              limit,
              page: postPage,
            }),
          );

          const countResponse = await directus.request(
            aggregate('posts', {
              aggregate: { count: '*' },
              filter: { status: { _eq: 'published' } },
            }),
          );

          const totalPages = Math.ceil(Number(countResponse[0]?.count || 0) / limit);

          // Attach the fetched posts to the block for frontend rendering
          (block.item as BlockPost & { posts: Post[]; totalPages: number }).posts = posts;
          (block.item as BlockPost & { totalPages: number }).totalPages = totalPages;
        }
      }
    }

    return page;
  } catch {
    throw new Error('Failed to fetch page data');
  }
};

/**
 * Fetches global site data, header navigation, and footer navigation.
 */
export const fetchSiteData = async () => {
  try {
    const [globals, headerNavigation, footerNavigation] = await Promise.all([
      directus.request(
        readSingleton('globals', {
          fields: ['id', 'title', 'description', 'logo', 'logo_dark_mode', 'social_links', 'accent_color', 'favicon'],
        }),
      ),
      directus.request(
        readItem('navigation', 'main', {
          fields: [
            'id',
            'title',
            {
              items: [
                'id',
                'title',
                {
                  page: ['permalink'],
                  children: ['id', 'title', 'url', { page: ['permalink'] }],
                },
              ],
            },
          ],
          deep: { items: { _sort: ['sort'] } },
        }),
      ),
      directus.request(
        readItem('navigation', 'footer', {
          fields: [
            'id',
            'title',
            {
              items: [
                'id',
                'title',
                {
                  page: ['permalink'],
                  children: ['id', 'title', 'url', { page: ['permalink'] }],
                },
              ],
            },
          ],
        }),
      ),
    ]);

    return { globals, headerNavigation, footerNavigation };
  } catch {
    throw new Error('Failed to fetch site data');
  }
};

/**
 * Fetches a single blog post by slug. Handles live preview mode
 */
export const fetchPostBySlug = async (slug: string, draft: boolean = false, token?: string) => {
  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const filter: QueryFilter<Schema, Post> =
      token || draft ? { slug: { _eq: slug } } : { slug: { _eq: slug }, status: { _eq: 'published' } };

    const posts = (await directus.request(
      withToken(
        token as string,
        readItems('posts', {
          filter,
          limit: 1,
          fields: [
            'id',
            'title',
            'content',
            'status',
            'published_at',
            'image',
            'description',
            'slug',
            'seo',
            {
              author: ['id', 'first_name', 'last_name', 'avatar'],
            },
          ],
        }),
      ),
    )) as Post[];

    const post = posts.length > 0 ? posts[0] : null;

    if (!post) {
      return null;
    }

    return post;
  } catch {
    throw new Error(`Failed to fetch post with slug "${slug}"`);
  }
};

/**
 * Fetches related blog posts excluding the given ID.
 */
export const fetchRelatedPosts = async (excludeId: string) => {
  try {
    const relatedPosts = (await directus.request(
      readItems('posts', {
        filter: { status: { _eq: 'published' }, id: { _neq: excludeId } },
        fields: ['id', 'title', 'image', 'slug', 'seo'],
        limit: 2,
      }),
    )) as Post[];

    return relatedPosts;
  } catch {
    throw new Error('Failed to fetch related posts');
  }
};

/**
 * Fetches author details by ID.
 */
export const fetchAuthorById = async (authorId: string) => {
  const { directus, readUser } = useDirectus();

  try {
    const author = (await directus.request(
      readUser(authorId, {
        fields: ['id', 'first_name', 'last_name', 'avatar'],
      }),
    )) as DirectusUser;

    return author;
  } catch {
    throw new Error(`Failed to fetch author with ID "${authorId}"`);
  }
};

/**
 * Fetches paginated blog posts.
 */
export const fetchPaginatedPosts = async (limit: number, page: number): Promise<Post[]> => {
  try {
    const response = (await directus.request(
      readItems('posts', {
        limit,
        page,
        sort: ['-published_at'],
        fields: ['id', 'title', 'description', 'slug', 'image'],
        filter: { status: { _eq: 'published' } },
      }),
    )) as Post[];

    return response;
  } catch {
    throw new Error('Failed to fetch paginated posts');
  }
};

/**
 * Search pages and posts for a given search term
 */
export const searchContent = async (search: string) => {
  try {
    const [pages, posts] = await Promise.all([
      directus.request(
        readItems('pages', {
          filter: {
            _or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
          },
          fields: ['id', 'title', 'permalink', 'seo'],
        }),
      ),
      directus.request(
        readItems('posts', {
          filter: {
            _and: [
              { status: { _eq: 'published' } },
              {
                _or: [
                  { title: { _contains: search } },
                  { description: { _contains: search } },
                  { slug: { _contains: search } },
                  { content: { _contains: search } },
                ],
              },
            ],
          },
          fields: ['id', 'title', 'description', 'slug', 'content', 'status'],
        }),
      ),
    ]);

    return [
      ...pages.map((page) => ({
        id: page.id,
        title: page.title,
        description: page.seo?.meta_description,
        type: 'Page',
        link: `/${page.permalink.replace(/^\/+/, '')}`,
      })),
      ...posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        type: 'Post',
        link: `/blog/${post.slug}`,
      })),
    ];
  } catch {
    throw new Error('Failed to search content');
  }
};

export const fetchAllPosts = async (): Promise<Post[]> => {
  try {
    const posts = (await directus.request(
      readItems('posts', {
        fields: ['id', 'slug', 'status', 'title'],
        filter: { status: { _eq: 'published' } },
      }),
    )) as Post[];

    return posts;
  } catch {
    throw new Error('Failed to fetch all blog posts');
  }
};
export const fetchAllPages = async (): Promise<Page[]> => {
  try {
    const pages = (await directus.request(
      readItems('pages', {
        fields: ['id', 'permalink', 'title'],
        filter: { status: { _neq: 'draft' } },
      }),
    )) as Page[];

    return pages.filter((p) => typeof p.permalink === 'string');
  } catch {
    throw new Error('Failed to fetch all pages');
  }
};

/**
 * Fetches page data by id and version
 */
export const fetchPageDataById = async (id: string, version: string, token?: string): Promise<Page> => {
  if (!id || id.trim() === '') {
    throw new Error('Invalid id: id must be a non-empty string');
  }

  if (!version || version.trim() === '') {
    throw new Error('Invalid version: version must be a non-empty string');
  }

  try {
    return (await directus.request(
      withToken(
        token as string,
        readItem('pages', id, {
          version,
          fields: pageFields,
          deep: {
            blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
          },
        }),
      ),
    )) as Page;
  } catch {
    throw new Error('Failed to fetch versioned page');
  }
};

/**
 * Helper function to get page ID by permalink
 */
export const getPageIdByPermalink = async (permalink: string, token?: string, preview?: boolean) => {
  if (!permalink || permalink.trim() === '') {
    throw new Error('Invalid permalink: permalink must be a non-empty string');
  }

  try {
    const pageData = (await directus.request(
      withToken(
        token as string,
        readItems('pages', {
          filter:
            preview && token
              ? { permalink: { _eq: permalink } }
              : { permalink: { _eq: permalink }, status: { _eq: 'published' } },
          limit: 1,
          fields: ['id'],
        }),
      ),
    )) as Pick<Page, 'id'>[];

    return pageData.length > 0 ? pageData[0].id : null;
  } catch {
    return null;
  }
};

/**
 * Helper function to get post ID by slug
 */
export const getPostIdBySlug = async (slug: string, token?: string) => {
  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const postData = (await directus.request(
      withToken(
        token as string,
        readItems('posts', {
          filter: { slug: { _eq: slug } },
          limit: 1,
          fields: ['id'],
        }),
      ),
    )) as Pick<Post, 'id'>[];

    return postData.length > 0 ? postData[0].id : null;
  } catch {
    return null;
  }
};

/**
 * Fetches a single blog post by ID and version
 */
export const fetchPostByIdAndVersion = async (
  id: string,
  version: string,
  slug: string,
  token?: string,
): Promise<{ post: Post; relatedPosts: Post[] }> => {
  if (!id || id.trim() === '') {
    throw new Error('Invalid id: id must be a non-empty string');
  }

  if (!version || version.trim() === '') {
    throw new Error('Invalid version: version must be a non-empty string');
  }

  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const postFields = [
      'id',
      'title',
      'content',
      'status',
      'published_at',
      'image',
      'description',
      'slug',
      'seo',
      {
        author: ['id', 'first_name', 'last_name', 'avatar'],
      },
    ] as const;

    const [postData, relatedPosts] = await Promise.all([
      directus.request(
        withToken(
          token as string,
          readItem('posts', id, {
            version,
            fields: postFields,
          }),
        ),
      ),
      fetchRelatedPosts(id),
    ]);

    return { post: postData as Post, relatedPosts };
  } catch {
    throw new Error('Failed to fetch versioned post');
  }
};
