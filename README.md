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

## Version 2: redesign and additions
**Design.** New design system built from the logo: deep-navy sea, teal and amber sails, cream hull. Bricolage Grotesque headings, Instrument Sans body. The home hero is a live sea chart whose stars are your published services. Service pages have a sticky "On this page" index; menus open as icon mega-panels; footer has a call-to-action band. One accent moment (the chart), everything else quiet.
**Brand colours are editable** in Admin > Settings > Brand (primary, accent, dark); the site re-themes with no rebuild. Header button label and link are editable too.
**New in admin:** FAQ, delivery-process and content-block editors (add, remove, reorder rows; no more JSON), parent-menu dropdown for navigation children, logo / favicon / sharing-image uploads, settings grouped by topic, email provider and sender settings (secrets stay in `server/.env`), **Users and roles** screen (create, change role, deactivate, reset password; the last Super Admin cannot be removed) and an **Audit log** screen.
**New on the public site:** JSON-LD structured data (Organization on home, Service on published service pages, BlogPosting on articles; emitted only from real data), blog category filter and featured first article, related services/products on solution pages, session cache for menus and settings.

## Brief checklist (what is and is not covered)
Covered: dynamic navigation and footer with the three link groups, 10 seeded services with the exact routes, dynamic service template with every field optional and the neutral placeholder, services directory with search, category filter and featured, full service admin with draft / published / unpublished and preview, sanitised rich text, products / solutions / pricing / portfolio / blog / careers / life / about / contact / demo, roles enforced on the server, rate limits, CSRF header, upload validation, audit log, sitemap and robots, backups and deploy notes.
Partly covered: "reusable page sections" is a fixed set of section types you can switch on and reorder per service (by design, no arbitrary HTML). Service categories are a text field, not a separate table. Media library is upload-only (no browse screen yet).
Not done: email sending (SMTP/provider is configured but nothing is sent; the key names are reserved in `.env.example`), email-based password reset, pre-rendering for search engines, automated tests.

## Verification status (read this)
- The new client code passed a TypeScript **syntax** check. A full `tsc` type-check and `npm run build` could not be run where this was edited (no npm registry access). Run `cd client && npm ci && npm run build` first and fix anything it reports.
- The PHP was edited without a PHP runtime available, and the API has never been run against a live MongoDB. Run `php -l` on `server/src/*.php`, then test every flow after deploying: login, create and publish a service, preview a draft, edit navigation, submit the contact and demo forms, create a user.
- The visual design has not been viewed in a browser. Expect small spacing or contrast tweaks.
- Solution entries seeded by `seed.php` are marked "DEMO CONTENT" in their description. Replace or delete them in Admin before launch.

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
