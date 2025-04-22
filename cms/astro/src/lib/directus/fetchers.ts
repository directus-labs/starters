import type { QueryFilter } from '@directus/sdk';
import { useDirectus } from './directus';
import type { BlockPost, Page, PageBlock, Post, Schema } from '@/types/directus-schema';

const { directus, readItems, readItem, readSingleton, aggregate } = useDirectus();

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (permalink: string, postPage = 1): Promise<Page> => {
  try {
    const pageData = await directus.request(
      readItems('pages', {
        filter: { permalink: { _eq: permalink } },
        limit: 1,
        fields: [
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
                  block_gallery: ['id', 'tagline', 'headline', { items: ['id', 'directus_file', 'sort'] }],
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
                          button: [
                            'id',
                            'label',
                            'variant',
                            'url',
                            'type',
                            { page: ['permalink'] },
                            { post: ['slug'] },
                          ],
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
                          buttons: [
                            'id',
                            'label',
                            'variant',
                            'url',
                            'type',
                            { page: ['permalink'] },
                            { post: ['slug'] },
                          ],
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
        ],
        deep: {
          blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } },
        },
      }),
    );

    if (!pageData.length) {
      throw new Error('Page not found');
    }

    const page = pageData[0];

    if (Array.isArray(page.blocks)) {
      for (const block of page.blocks as PageBlock[]) {
        if (
          block.collection === 'block_posts' &&
          typeof block.item === 'object' &&
          (block.item as BlockPost).collection === 'posts'
        ) {
          const limit = (block.item as BlockPost).limit ?? 6;

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
export const fetchPostBySlug = async (slug: string, preview: boolean = false, token: string | null = null) => {
  try {
    const filter: QueryFilter<Schema, Post> = preview
      ? { slug: { _eq: slug } }
      : { slug: { _eq: slug }, status: { _eq: 'published' } };

    const posts = await directus.request(
      readItems('posts', {
        filter,
        limit: 1,
        fields: ['id', 'title', 'content', 'status', 'image', 'description', 'author', 'seo'],
        ...(token ? { access_token: token } : {}),
      }),
    );

    const post = posts[0];

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
    const relatedPosts = await directus.request(
      readItems('posts', {
        filter: { status: { _eq: 'published' }, id: { _neq: excludeId } },
        fields: ['id', 'title', 'image', 'slug', 'seo'],
        limit: 2,
      }),
    );

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
    const author = await directus.request(
      readUser(authorId, {
        fields: ['id', 'first_name', 'last_name', 'avatar'],
      }),
    );

    return author;
  } catch {
    throw new Error(`Failed to fetch author with ID "${authorId}"`);
  }
};

/**
 * Fetches paginated blog posts.
 */
export const fetchPaginatedPosts = async (limit: number, page: number) => {
  try {
    const response = await directus.request(
      readItems('posts', {
        limit,
        page,
        sort: ['-published_at'],
        fields: ['id', 'title', 'description', 'slug', 'image'],
        filter: { status: { _eq: 'published' } },
      }),
    );

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
    const posts = await directus.request(
      readItems('posts', {
        fields: ['id', 'slug', 'status', 'title'],
        filter: { status: { _eq: 'published' } },
      }),
    );

    return posts;
  } catch {
    throw new Error('Failed to fetch all blog posts');
  }
};
export const fetchAllPages = async (): Promise<Page[]> => {
  try {
    const pages = await directus.request(
      readItems('pages', {
        fields: ['id', 'permalink', 'title'],
        filter: { status: { _neq: 'draft' } },
      }),
    );

    return pages.filter((p) => typeof p.permalink === 'string');
  } catch {
    throw new Error('Failed to fetch all pages');
  }
};
