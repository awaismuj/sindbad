# Sindbad Solution — website + admin (React + PHP + MongoDB)

```
client/   React + TypeScript + Vite + Tailwind (public site + /admin)
server/   PHP 8.2+ JSON API (own tiny router), MongoDB via mongodb/mongodb
deploy/   nginx.conf, backup.sh
```

## What works (implemented)
- Public: home, solutions + industry pages, products + detail, a searchable service directory and per-service detail pages, pricing, portfolio, blog (search), managed About/Careers/Life pages, contact, demo, and 404.
- Forms (contact, demo) -> validated server-side -> saved in MongoDB. Honeypot, rate limit (5/hour/IP), duplicate guard, source page recorded.
- Admin (/admin): login, dashboard (real counts), enquiries and demo requests, and content editors for products, industries, services, clients, pages, pricing plans, blog, portfolio, FAQs, and site settings. Services have draft/published/unpublished states, configurable page content, SEO, relationships, menu/footer visibility and display order. Navigation and footer groups are editable as validated JSON in Settings.
- Homepage client logo showcase is database-driven. Manage client logos and visibility in **Admin → Clients**, and marquee behavior in **Admin → Client showcase settings**. It uses CSS animation, switches to a centered static layout when there is insufficient content to scroll, and honors reduced-motion preferences. No client records are seeded.
- Image upload for content and brand images (JPEG, PNG, WebP; maximum 4 MB) uses authenticated admin access and stores randomized filenames under `UPLOAD_DIR`.
- Roles enforced on the server: super_admin (all), content_manager (content/settings), sales_manager (leads/demos). Argon2id hashes, session cookie (HttpOnly, SameSite=Strict), CSRF header, login rate limit, audit log.

## Not done yet (be aware)
- Email/SMTP notifications and password-reset by email (no email is sent; nothing pretends to be).
- Rich text editing, job listing/application workflows, product/solution/pricing management are at different levels of completeness; page content currently uses safe plain-text fields. User-management screen (API exists: POST /api/admin/users) and editable brand colors are not implemented.
- sitemap.xml and pre-rendering for SEO (robots.txt and per-page titles/meta/canonical exist; Google can render React but pre-rendering is better).
- Automated tests. The client builds; PHP + MongoDB code was syntax-checked and the validator unit-tested, but the API has NOT been run against a live MongoDB. Test every flow on your server first.

## Setup on the Contabo VPS (Ubuntu 24.04)
```bash
apt update && apt install -y nginx php-fpm php-cli php-mbstring php-curl php-xml php-dev php-pear composer unzip git ufw fail2ban certbot python3-certbot-nginx
pecl install mongodb && echo "extension=mongodb.so" > /etc/php/8.3/mods-available/mongodb.ini && phpenmod mongodb && systemctl restart php8.3-fpm
# MongoDB 7: follow https://www.mongodb.com/docs/manual/administration/install-on-linux/ then enable auth, bind 127.0.0.1
mongosh  # use sindbad; db.createUser({user:"sindbad_app",pwd:"STRONG",roles:[{role:"readWrite",db:"sindbad"}]})
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```
Deploy:
```bash
mkdir -p /var/www/sindbad && cd /var/www/sindbad   # upload/unzip this project here
cd server && composer install --no-dev -o && cp .env.example .env && nano .env   # real secrets
php scripts/seed.php          # indexes, first Super Admin, DEMO content (edit/delete it in admin)
cd ../client && npm ci && npm run build
cp ../deploy/nginx.conf /etc/nginx/sites-available/sindbadsolution.com && ln -s /etc/nginx/sites-available/sindbadsolution.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx && certbot --nginx -d sindbadsolution.com -d www.sindbadsolution.com
```
Set `APP_ENV=production` (secure cookies need HTTPS). Ensure PHP upload limits and Nginx permit at least 5 MB requests, and the PHP-FPM user can write to `UPLOAD_DIR`. Never commit `.env`.

## Local development
Run MongoDB locally, then: `cd server && composer install && cp .env.example .env && php scripts/seed.php && php -S 127.0.0.1:8080 -t public public/index.php`, and in another terminal `cd client && npm install && npm run dev` (Vite proxies /api to :8080). Open http://localhost:5173 and /admin.

## Backups and recovery
`deploy/backup.sh` (nightly MongoDB dump plus uploaded-media archive, 14-day rotation). Restore the database with `mongorestore --uri=... --archive=FILE.gz --gzip --drop`; extract the matching `media-YYYY-MM-DD.tar.gz` into `UPLOAD_DIR`. Copy backups off the server.

## Adding a new content type
Add one entry in `server/src/Content.php` and one in `client/src/lib/schema.ts`; public and admin CRUD endpoints are generated.

## Managing services and pages
Use **Admin → Services** to create or edit service records. Publish a service only after verifying its description and claims; the seeded catalog intentionally contains only the requested names and categories. Set menu/footer visibility as needed. Draft page previews require an authenticated admin session. Uploaded images can be selected in the editor or referenced by URL.

Use **Admin → Pages** to edit About, Careers, and Life at Sindbad content. Navigation and footer groups can be edited in **Admin → Settings** as JSON; internal paths must begin with a single `/`, and external links must use HTTPS.
