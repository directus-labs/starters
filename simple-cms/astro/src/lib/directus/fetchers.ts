import { useDirectus } from "./directus";
import type { BlockPost, PageBlock, Post } from "@/types/directus-schema";

const { directus, readItems, readItem, readSingleton, aggregate } =
  useDirectus();

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (permalink: string, postPage = 1) => {
  try {
    const pageData = await directus.request(
      readItems("pages", {
        filter: { permalink: { _eq: permalink } },
        limit: 1,
        fields: [
          "title",
          "description",
          {
            blocks: [
              "id",
              "background",
              "collection",
              "item",
              "sort",
              {
                item: {
                  block_richtext: [
                    "tagline",
                    "headline",
                    "content",
                    "alignment",
                  ],
                  block_gallery: [
                    "id",
                    "tagline",
                    "headline",
                    { items: ["id", "directus_file", "sort"] },
                  ],
                  block_pricing: [
                    "tagline",
                    "headline",
                    {
                      pricing_cards: [
                        "id",
                        "title",
                        "description",
                        "price",
                        "badge",
                        "features",
                        "is_highlighted",
                        {
                          button: [
                            "id",
                            "label",
                            "variant",
                            "url",
                            "type",
                            { page: ["permalink"] },
                            { post: ["slug"] },
                          ],
                        },
                      ],
                    },
                  ],
                  block_hero: [
                    "tagline",
                    "headline",
                    "description",
                    "layout",
                    "image",
                    {
                      button_group: [
                        "id",
                        {
                          buttons: [
                            "id",
                            "label",
                            "variant",
                            "url",
                            "type",
                            { page: ["permalink"] },
                            { post: ["slug"] },
                          ],
                        },
                      ],
                    },
                  ],
                  block_posts: ["tagline", "headline", "collection", "limit"],
                  block_form: [
                    "id",
                    "tagline",
                    "headline",
                    {
                      form: [
                        "id",
                        "title",
                        "submit_label",
                        "success_message",
                        "on_success",
                        "success_redirect_url",
                        "is_active",
                        {
                          fields: [
                            "id",
                            "name",
                            "type",
                            "label",
                            "placeholder",
                            "help",
                            "validation",
                            "width",
                            "choices",
                            "required",
                            "sort",
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
        deep: { blocks: { _sort: ["sort"] } },
      })
    );

    if (!pageData.length) throw new Error("Page not found");

    const page = pageData[0];

    // Fetch posts dynamically if the block contains them
    if (Array.isArray(page.blocks)) {
      for (const block of page.blocks as PageBlock[]) {
        if (
          block.collection === "block_posts" &&
          typeof block.item === "object"
        ) {
          const limit = (block.item as BlockPost).limit ?? 6;
          const posts = await directus.request<Post[]>(
            readItems("posts", {
              fields: [
                "id",
                "title",
                "description",
                "slug",
                "image",
                "status",
                "published_at",
              ],
              filter: { status: { _eq: "published" } },
              sort: ["-published_at"],
              limit,
              page: postPage,
            })
          );
          (block.item as BlockPost & { posts: Post[] }).posts = posts;
        }
      }
    }

    return page;
  } catch (error) {
    console.error("Error fetching page data:", error);
    throw new Error("Failed to fetch page data");
  }
};

/**
 * Fetches global site data, including navigation and footer.
 */
export const fetchSiteData = async () => {
  try {
    const [globals, headerNavigation, footerNavigation] = await Promise.all([
      directus.request(
        readSingleton("globals", {
          fields: [
            "title",
            "description",
            "logo",
            "logo_dark_mode",
            "social_links",
            "accent_color",
            "favicon",
          ],
        })
      ),
      directus.request(
        readItem("navigation", "main", {
          fields: [
            {
              items: [
                "id",
                "title",
                {
                  page: ["permalink"],
                  children: ["id", "title", "url", { page: ["permalink"] }],
                },
              ],
            },
          ],
          deep: { items: { _sort: ["sort"] } },
        })
      ),
      directus.request(
        readItem("navigation", "footer", {
          fields: [
            {
              items: [
                "id",
                "title",
                {
                  page: ["permalink"],
                  children: ["id", "title", "url", { page: ["permalink"] }],
                },
              ],
            },
          ],
        })
      ),
    ]);

    return { globals, headerNavigation, footerNavigation };
  } catch (error) {
    console.error("Error fetching site data:", error);
    throw new Error("Failed to fetch site data");
  }
};

/**
 * Fetches a blog post by slug.
 */
export const fetchPostBySlug = async (
  slug: string,
  options?: { draft?: boolean }
) => {
  try {
    const filter = options?.draft
      ? { slug: { _eq: slug } }
      : { slug: { _eq: slug }, status: { _eq: "published" } };

    const posts = await directus.request(
      readItems("posts", {
        filter,
        limit: 1,
        fields: [
          "id",
          "title",
          "content",
          "status",
          "image",
          "description",
          "author",
          "seo",
        ],
      })
    );

    return posts[0] ?? null;
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    throw new Error(`Failed to fetch post with slug "${slug}"`);
  }
};

/**
 * Fetches the total count of published blog posts.
 */
export const fetchTotalPostCount = async (): Promise<number> => {
  try {
    const response = await directus.request(
      aggregate("posts", {
        aggregate: { count: "*" },
        filter: { status: { _eq: "published" } },
      })
    );

    return Number(response[0]?.count) || 0;
  } catch (error) {
    console.error("Error fetching total post count:", error);
    return 0;
  }
};

/**
 * Fetches paginated blog posts.
 */
export const fetchPaginatedPosts = async (limit: number, page: number) => {
  const { directus } = useDirectus();
  try {
    const response = await directus.request(
      readItems("posts", {
        limit,
        page,
        sort: ["-published_at"],
        fields: ["id", "title", "description", "slug", "image"],
        filter: { status: { _eq: "published" } },
      })
    );

    return response;
  } catch (error) {
    console.error("Error fetching paginated posts:", error);
    throw new Error("Failed to fetch paginated posts");
  }
};
