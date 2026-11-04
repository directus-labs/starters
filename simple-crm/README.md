# Simple CRM

A simple CRM template for Directus. Manage contacts, organizations, and deals with a clean pipeline view.

## Getting Started

### Using Directus Cloud

1. Create a new project at [Directus Cloud](https://directus.io/cloud/) and select the **Simple CRM** template.
2. Generate a static token for the admin user.

### Using Docker (Local)

```bash
npx directus-template-cli@latest init
```

Select **Simple CRM** from the template list and follow the prompts.

## What's Included

- Contacts and organizations
- Deal pipeline with stages
- Activities and activity tracking
- Tags for contacts and organizations
- Dashboards
- Flows on contact and deal pages: **New Activity** and **Send Email**

### Send Email

Run it from a contact or deal. Leave **To** blank to email the contact, or everyone on the deal. Each email is logged as a completed "email" activity on the record. If there's nobody to send to, you get a Directus notification instead.

It sends through your Directus email settings (`EMAIL_TRANSPORT`, `EMAIL_FROM`, `EMAIL_SMTP_*` in `directus/.env`). Delivery errors show up in the Directus logs, not in Studio.

## Licensing

This template targets **Directus 12** and fits the free core tier (12 collections, 2 flows, 2 seats). It has no public permissions, so there's no separate licensed variant. A `LICENSE_KEY` only raises the tier limits.
