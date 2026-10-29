# Sindbad Solution — website + admin (React + PHP + MongoDB)

```
client/   React + TypeScript + Vite + Tailwind (public site + /admin)
server/   PHP 8.2+ JSON API (own tiny router), MongoDB via mongodb/mongodb
deploy/   nginx.conf, backup.sh
```

## What works (implemented)
- Public: home, solutions + industry pages, products + detail, services, pricing, portfolio, blog (search), about, contact, demo, 404. All content comes from the API.
- Forms (contact, demo) -> validated server-side -> saved in MongoDB. Honeypot, rate limit (5/hour/IP), duplicate guard, source page recorded.
- Admin (/admin): login, dashboard (real counts), enquiries and demo requests (search, filter, paginate, status, notes, assign, schedule, outcome, CSV export), content editor for products, industries, services, pricing plans, blog, portfolio, FAQs, and site settings.
- Roles enforced on the server: super_admin (all), content_manager (content/settings), sales_manager (leads/demos). Argon2id hashes, session cookie (HttpOnly, SameSite=Strict), CSRF header, login rate limit, audit log.

## Not done yet (be aware)
- Email/SMTP notifications and password-reset by email (no email is sent; nothing pretends to be).
- Image upload (admin takes image URLs for now), user-management screen (API exists: POST /api/admin/users), navigation/footer editing UI, logo/colour settings.
- sitemap.xml and pre-rendering for SEO (robots.txt and per-page titles/meta/canonical exist; Google can render React but pre-rendering is better).
- Automated tests. The client builds; PHP + MongoDB code was syntax-checked and the validator unit-tested, but the API has NOT been run against a live MongoDB. Test every flow on your server first.

## Setup on the Contabo VPS (Ubuntu 24.04)
```bash
apt update && apt install -y nginx php-fpm php-cli php-mbstring php-curl php-xml php-dev composer unzip git ufw fail2ban certbot python3-certbot-nginx
# Install PIE using https://github.com/php/pie, then install the MongoDB extension tested with PHP 8.5.
pie install mongodb/mongodb-extension:2.5.5
# Ensure the extension is enabled for both the PHP CLI and the PHP-FPM version serving the site.
php --ri mongodb
systemctl restart php8.5-fpm  # replace 8.5 with the installed PHP-FPM version
# MongoDB 7: follow https://www.mongodb.com/docs/manual/administration/install-on-linux/ then enable auth, bind 127.0.0.1
mongosh  # use sindbad; db.createUser({user:"sindbad_app",pwd:"STRONG",roles:[{role:"readWrite",db:"sindbad"}]})
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```
Deploy:
```bash
mkdir -p /var/www/sindbad && cd /var/www/sindbad   # upload/unzip this project here
cd server && composer update --no-dev -o && composer check-platform-reqs && cp .env.example .env && nano .env   # real secrets
php scripts/seed.php          # indexes, first Super Admin, DEMO content (edit/delete it in admin)
cd ../client && npm ci && npm run build
cp ../deploy/nginx.conf /etc/nginx/sites-available/sindbadsolution.com && ln -s /etc/nginx/sites-available/sindbadsolution.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx && certbot --nginx -d sindbadsolution.com -d www.sindbadsolution.com
```
Set `APP_ENV=production` (secure cookies need HTTPS). Never commit `.env`.

## Local development
Run MongoDB locally, then: `cd server && composer install && cp .env.example .env && php scripts/seed.php && php -S 127.0.0.1:8080 -t public public/index.php`, and in another terminal `cd client && npm install && npm run dev` (Vite proxies /api to :8080). Open http://localhost:5173 and /admin.

## Backups and recovery
`deploy/backup.sh` (nightly mongodump, 14-day rotation). Restore: `mongorestore --uri=... --archive=FILE.gz --gzip --drop`. Copy backups off the server.

## Adding a new content type
Add one entry in `server/src/Content.php` and one in `client/src/lib/schema.ts`; public and admin CRUD endpoints are generated.
