import { useDirectus } from "@/lib/directus/directus";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("search");

  if (!search || search.length < 3) {
    return new Response(
      JSON.stringify({ error: "Query must be at least 3 characters." }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { directus, readItems } = useDirectus();

  try {
    const [pages, posts] = await Promise.all([
      directus.request(
        readItems("pages", {
          filter: {
            _or: [
              { title: { _contains: search } },
              { description: { _contains: search } },
              { permalink: { _contains: search } },
            ],
          },
          fields: ["id", "title", "description", "permalink"],
        })
      ),

      directus.request(
        readItems("posts", {
          filter: {
            _and: [
              { status: { _eq: "published" } },
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
          fields: ["id", "title", "description", "slug", "content", "status"],
        })
      ),
    ]);

    const results = [
      ...pages.map((page: any) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        type: "Page",
        link: `/${page.permalink.replace(/^\/+/, "")}`,
      })),

      ...posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        type: "Post",
        link: `/blog/${post.slug}`,
      })),
    ];

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching search results:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch search results." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
