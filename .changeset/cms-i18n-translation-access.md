---
"directus-cms-i18n-starter": patch
---

Editors and writers can now edit translations, and the Public policy no longer returns translations of draft pages and posts.

- Content - Manage gets the same access to every `*_translations` collection as to its parent, reads `languages`, and sees `translations` on Globals.
- Writers can create, read, update and delete translations on posts they created.
- Public reads page and post translations only when the parent is published.
