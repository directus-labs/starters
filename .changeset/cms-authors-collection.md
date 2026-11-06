---
"directus-cms-starter": major
"directus-cms-i18n-starter": major
---

Post bylines now come from a new `authors` collection, not `directus_users`, and the Public policy no longer reads `directus_users`. On core, that rule exposed every user's profile and email (#145).

- `posts.author` points at `authors` (`name`, `avatar`, `bio`). Authors don't need a Studio account.
- Public and Live Preview read `authors`. Content - Manage has full access.
- Licensed: writers own the posts they created (`user_created`) and can't hand them to someone else. Who's credited (`author`) is separate from who can edit.
- Frontends fetch `author: ['id', 'name', 'avatar']` and render `author.name`.

To upgrade an existing project:

1. Security fix on its own: remove the Public policy's read access to Directus Users. Post bylines stop resolving until the steps below.
2. Create an `authors` collection (`name`, `avatar`, `bio`). Give the Public and Content - Live Preview policies read access to it, and Content - Manage full access.
3. Add an author for each user credited on posts. Reusing the user's id keeps existing `posts.author` values valid.
4. Repoint `posts.author` through the API. The Studio can't change an existing relation's related collection, and deleting the field there deletes the author values.
   - `DELETE /relations/posts/author` (drops the relation, keeps the column)
   - `DELETE /fields/directus_users/posts`
   - `POST /relations` with collection `posts`, field `author`, related_collection `authors`, `schema.on_delete` `SET NULL` and `meta.one_field` `posts`
   - `POST /fields/authors` with an o2m alias field named `posts`
5. Set the `posts.author` interface and display template to `{{avatar.$thumbnail}} {{name}}`. The old `{{first_name}} {{last_name}}` template shows no names once the field points at `authors`.
6. Frontend: fetch `author: ['id', 'name', 'avatar']` and render `author.name`.
7. Licensed: remove the Writer posts create preset (`author: $CURRENT_USER`), filter Writer read and update on `user_created` instead of `author`, and take `user_created` and `user_updated` out of the Writer update fields.
