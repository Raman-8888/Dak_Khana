#!/bin/sh
set -e

echo "==> [DakExport] Starting Laravel boot sequence..."

# ── 1. Generate app key if not set ──────────────────────────────────────────
if [ -z "$APP_KEY" ]; then
    echo "==> Generating APP_KEY..."
    php artisan key:generate --force
fi

# ── 2. Create SQLite database file if using sqlite ──────────────────────────
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    if [ ! -f "$DB_PATH" ]; then
        echo "==> Creating SQLite database at $DB_PATH"
        touch "$DB_PATH"
        chown www-data:www-data "$DB_PATH"
    fi
fi

# ── 3. Run migrations (safe: --force required in production) ─────────────────
echo "==> Running migrations..."
php artisan migrate --force

# ── 4. Cache config/routes/views for performance ────────────────────────────
echo "==> Caching config, routes and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ── 5. Fix storage permissions (Render mounts can reset them) ───────────────
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ── 6. Create the storage symlink if missing ─────────────────────────────────
php artisan storage:link --force 2>/dev/null || true

echo "==> Boot sequence complete. Starting supervisord..."

# ── 7. Hand off to supervisord (nginx + php-fpm) ─────────────────────────────
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
