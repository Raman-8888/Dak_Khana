# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Composer dependency install (no dev deps in prod)
# ─────────────────────────────────────────────────────────────────────────────
FROM composer:2.7 AS vendor

WORKDIR /app

# Copy only composer files first for better layer caching
COPY composer.json composer.lock ./

# Install production dependencies only (no scripts yet – app files not present)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --ignore-platform-reqs \
    --prefer-dist

# Copy the full app then regenerate the optimised autoloader
COPY . .
RUN composer dump-autoload --no-dev --classmap-authoritative

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Runtime image: PHP 8.2-FPM + Nginx in a single container
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-bookworm

# ── System packages ──────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    unzip \
    git \
    libpq-dev \
    libsqlite3-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libonig-dev \
    libxml2-dev \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# ── PHP extensions ───────────────────────────────────────────────────────────
RUN docker-php-ext-install \
    pdo \
    pdo_sqlite \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    zip \
    bcmath \
    xml \
    pcntl \
    opcache

# ── Opcache tuning (production) ──────────────────────────────────────────────
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini

# ── App directory ────────────────────────────────────────────────────────────
WORKDIR /var/www/html

# Copy vendor from build stage
COPY --from=vendor /app/vendor ./vendor

# Copy application source
COPY . .

# ── Permissions ──────────────────────────────────────────────────────────────
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 775 storage bootstrap/cache

# ── SQLite database file (used when DB_CONNECTION=sqlite) ────────────────────
RUN mkdir -p /var/www/html/database \
 && touch /var/www/html/database/database.sqlite \
 && chown www-data:www-data /var/www/html/database/database.sqlite

# ── Nginx configuration ──────────────────────────────────────────────────────
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Remove the default nginx site and symlink ours
RUN rm -f /etc/nginx/sites-enabled/default \
 && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# ── Supervisor: run nginx + php-fpm together ─────────────────────────────────
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ── Startup script ───────────────────────────────────────────────────────────
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Render expects the container to listen on port 10000
EXPOSE 10000

CMD ["/start.sh"]
