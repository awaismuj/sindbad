# Sindbad Solution: website + admin (React + PHP + MongoDB)

```
client/   React + TypeScript + Vite + Tailwind. Public site and /admin
server/   PHP 8.2+ JSON API (own small router), MongoDB via mongodb/mongodb
deploy/   nginx.conf, backup.sh
```

## What is implemented
**Everything public is read from the database.** Nothing about services, products, pricing, navigation or pages is hard-coded in the frontend (only structural labels such as "Request a quote").
- **Services**: 10 seeded (name, slug, category only; you write the content). `/services` directory grouped by category with search; `/services/:slug` dynamic template with every field from your brief, each optional. If a service has no content yet, the page shows your configurable placeholder message and a "Contact us to discuss your requirements" button. Sections can be turned on/off and re-ordered per service. Draft, Published, Unpublished; **draft preview** in admin; only Published is public and in the sitemap.
- **Navigation and footer**: header (with dropdowns auto-filled from published services/products/solutions, or manual children), Quick links, Explore, and footer service links (any service with "Show in footer"). Admin can add, edit, reorder, hide per desktop/mobile. Internal links are checked on save (a link to a service that does not exist is rejected); external links must be http(s).
- **Pages**: Home blocks, About (intro, mission, vision, values, blocks), Life at Sindbad (content, blocks, gallery), Careers (intro + job listings + applications form, applications visible in admin). **Solutions** (industries), Products, Pricing plans, Portfolio, Blog (draft/published, search, author), FAQs.
- **Admin**: dashboard (real counts), enquiries, demo requests, job applications (search, filter, paginate, status, notes, CSV export), rich text editor (bold, italic, headings, lists, links, images, tables), image upload, site settings (logo, favicon, contacts, social, SEO defaults, copyright, legal links, analytics ID, placeholder text).
- **Security**: roles enforced on the server (super_admin, content_manager, sales_manager), Argon2id, HttpOnly SameSite=Strict session, CSRF header, rate limits (login, forms, uploads), honeypot, allow-list HTML sanitizer for all rich text, upload checks (type sniffed, max 3 MB, random names, no SVG), audit log.
- **SEO**: per-page titles/meta/Open Graph/canonical, `robots.txt`, dynamic `sitemap.xml`.

## Added in this update
- **Settings** now covers everything in the brief: logo, favicon, legal links, copyright, analytics ID, default social image, **brand colours** (applied site-wide), notification email.
- **Safer links**: renaming a slug updates menu links and "related" lists; deleting a service/product/solution removes it from related lists and switches off menu links to it; a product with pricing plans, or a category still in use, cannot be deleted. Category renames carry over to services.
- **Service categories** screen (controls the order of groups on /services; services pick from the list).
- **Friendlier editors**: FAQs, delivery steps and content blocks are add/remove/reorder rows (no JSON); related services/products/case studies are tick boxes; menu dropdown parent is a drop-down.
- **Users** screen (add, change role, deactivate, reset password; cannot lock yourself out or remove the last Super Admin), **My account** (change password), **Activity log**, **Media library** (upload, copy address, delete with a "still used in" check).
- **Email notifications** for new enquiries, demo requests and job applications over SMTP (set `SMTP_*` in `server/.env`; off until configured; the form response is never delayed by mail).
- **SEO**: nginx now sends page requests through PHP, which injects title, description, canonical, Open Graph and JSON-LD (Organization, Service, BlogPosting, breadcrumbs, only from fields you filled in) into `index.html`, and returns a real 404 for missing or unpublished pages. Sitemap has last-modified dates.
- Deploy note: re-run `php scripts/seed.php` (adds the service categories; nothing existing is overwritten) and copy the new `deploy/nginx.conf`.

## Not done yet
- Self-service password reset by email (a Super Admin resets passwords under Users).
- Automated tests. The client typechecks and builds; the PHP HTML sanitizer and validator were unit-tested; **the API has not been run against a live MongoDB**. In this update the mailer was tested against a local SMTP server, the SEO injector with stub data, and the admin/public screens were rendered in Chromium with a mocked API. Test every flow after deploying.
- EBS in "EBS ERP Solution" is deliberately undefined until you describe it in the admin.

## Deploy on the Contabo VPS (Ubuntu 24.04) with MongoDB Atlas
```bash
apt update && apt install -y nginx php-fpm php-cli php-mbstring php-curl php-xml php-dev php-pear composer unzip nodejs npm ufw fail2ban certbot python3-certbot-nginx
pecl install mongodb && echo "extension=mongodb.so" > /etc/php/8.3/mods-available/mongodb.ini && phpenmod mongodb
sed -i 's/^upload_max_filesize.*/upload_max_filesize = 4M/; s/^post_max_size.*/post_max_size = 6M/' /etc/php/8.3/fpm/php.ini && systemctl restart php8.3-fpm
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```
In Atlas: create a database user, and under Network Access add the VPS public IP.
```bash
mkdir -p /var/www/sindbad /var/www/sindbad/uploads && cd /var/www/sindbad    # unzip the project here
chown -R www-data:www-data uploads
cd server && composer install --no-dev -o && cp .env.example .env && nano .env   # MONGO_URI, SEED_ADMIN_*, APP_ENV=production, UPLOAD_DIR
php scripts/seed.php        # indexes, first Super Admin, services, navigation, empty pages
cd ../client && npm ci && npm run build
cp ../deploy/nginx.conf /etc/nginx/sites-available/sindbadsolution.com && ln -s /etc/nginx/sites-available/sindbadsolution.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx && certbot --nginx -d sindbadsolution.com -d www.sindbadsolution.com
```
Never commit `.env`. After logging in at `/admin`, change the seeded password.

## Local development
`cd server && composer install && cp .env.example .env && php scripts/seed.php && php -S 127.0.0.1:8080 -t public public/index.php` and in another terminal `cd client && npm install && npm run dev` (Vite proxies /api and /uploads to :8080).

## Daily use
Admin > Services: Add new, fill what you have, set Status to Published. It appears on /services, in the menu dropdown (Show in navigation dropdown) and the footer (Show in footer) with no code change. Use Preview while it is a draft. Navigation > edit links. Pages > about / life-at-sindbad / careers / home.

## Backups
`deploy/backup.sh` runs `mongodump` (Atlas also offers its own backups; enable them). Restore with `mongorestore --uri=... --archive=FILE.gz --gzip --drop`. Back up `/var/www/sindbad/uploads` too.

## Adding a content type
One entry in `server/src/Content.php`, one in `client/src/lib/schema.ts`.
