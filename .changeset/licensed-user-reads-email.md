---
"directus-cms-starter": patch
"directus-cms-i18n-starter": patch
"directus-blank-starter": patch
---

Licensed Team users read only profile fields on `directus_users` (no `auth_data`), and `EMAIL_TRANSPORT` defaults to `sendmail` so notifications no longer fail with a 500 when it's unset (#144).
