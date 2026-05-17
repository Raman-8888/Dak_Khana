-- ============================================================
-- DakExport — Full Database Schema
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ── 1. Core Laravel tables ──────────────────────────────────

CREATE TABLE IF NOT EXISTS migrations (
    id          SERIAL PRIMARY KEY,
    migration   VARCHAR(255) NOT NULL,
    batch       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at  TIMESTAMP NULL,
    password           VARCHAR(255) NOT NULL,
    role               VARCHAR(50)  NOT NULL DEFAULT 'customer'
                           CHECK (role IN (
                               'customer','delivery_agent','operations_executive',
                               'warehouse_manager','finance','compliance_officer',
                               'support_agent','regional_manager','admin','super_admin'
                           )),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    phone              VARCHAR(20)  NULL,
    avatar             VARCHAR(255) NULL,
    employee_id        VARCHAR(255) NULL,
    remember_token     VARCHAR(100) NULL,
    created_at         TIMESTAMP NULL,
    updated_at         TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email       VARCHAR(255) PRIMARY KEY,
    token       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id            VARCHAR(255) PRIMARY KEY,
    user_id       BIGINT NULL,
    ip_address    VARCHAR(45) NULL,
    user_agent    TEXT NULL,
    payload       TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index        ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_index  ON sessions (last_activity);

-- ── 2. Cache & Queue tables ─────────────────────────────────

CREATE TABLE IF NOT EXISTS cache (
    key        VARCHAR(255) PRIMARY KEY,
    value      TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    key        VARCHAR(255) PRIMARY KEY,
    owner      VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
    id           BIGSERIAL PRIMARY KEY,
    queue        VARCHAR(255) NOT NULL,
    payload      TEXT NOT NULL,
    attempts     SMALLINT NOT NULL,
    reserved_at  INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS jobs_queue_index ON jobs (queue);

CREATE TABLE IF NOT EXISTS job_batches (
    id              VARCHAR(255) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    total_jobs      INTEGER NOT NULL,
    pending_jobs    INTEGER NOT NULL,
    failed_jobs     INTEGER NOT NULL,
    failed_job_ids  TEXT NOT NULL,
    options         TEXT NULL,
    cancelled_at    INTEGER NULL,
    created_at      INTEGER NOT NULL,
    finished_at     INTEGER NULL
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id         BIGSERIAL PRIMARY KEY,
    uuid       VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue      TEXT NOT NULL,
    payload    TEXT NOT NULL,
    exception  TEXT NOT NULL,
    failed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Sanctum personal access tokens ──────────────────────

CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id             BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id   BIGINT NOT NULL,
    name           VARCHAR(255) NOT NULL,
    token          VARCHAR(64) NOT NULL UNIQUE,
    abilities      TEXT NULL,
    last_used_at   TIMESTAMP NULL,
    expires_at     TIMESTAMP NULL,
    created_at     TIMESTAMP NULL,
    updated_at     TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS pat_tokenable_idx ON personal_access_tokens (tokenable_type, tokenable_id);

-- ── 4. Export / Shipment core ───────────────────────────────

CREATE TABLE IF NOT EXISTS export_requests (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracking_number  VARCHAR(50) NOT NULL UNIQUE,
    status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                         CHECK (status IN (
                             'pending','processing','dispatched',
                             'in_transit','delivered','returned','cancelled','on_hold'
                         )),
    origin_country   VARCHAR(3) NOT NULL DEFAULT 'IN',
    destination_country VARCHAR(3) NOT NULL,
    declared_value   DECIMAL(12,2) NULL,
    weight_kg        DECIMAL(8,3) NULL,
    notes            TEXT NULL,
    created_at       TIMESTAMP NULL,
    updated_at       TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS er_user_id_idx    ON export_requests (user_id);
CREATE INDEX IF NOT EXISTS er_status_idx     ON export_requests (status);
CREATE INDEX IF NOT EXISTS er_tracking_idx   ON export_requests (tracking_number);

-- ── 5. Agent tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_shifts (
    id                BIGSERIAL PRIMARY KEY,
    agent_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status            VARCHAR(10) NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','ended','paused')),
    started_at        TIMESTAMP NOT NULL,
    ended_at          TIMESTAMP NULL,
    total_deliveries  SMALLINT NOT NULL DEFAULT 0,
    total_earnings    DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NULL,
    updated_at        TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS agent_locations (
    id           BIGSERIAL PRIMARY KEY,
    agent_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat          DECIMAL(10,7) NOT NULL,
    lng          DECIMAL(10,7) NOT NULL,
    accuracy     FLOAT NULL,
    recorded_at  TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_assignments (
    id              BIGSERIAL PRIMARY KEY,
    shipment_id     BIGINT NOT NULL REFERENCES export_requests(id) ON DELETE CASCADE,
    agent_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status          VARCHAR(15) NOT NULL DEFAULT 'assigned'
                        CHECK (status IN (
                            'assigned','picked_up','in_transit',
                            'delivered','failed','rescheduled','cancelled'
                        )),
    assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    picked_at       TIMESTAMP NULL,
    delivered_at    TIMESTAMP NULL,
    scheduled_for   TIMESTAMP NULL,
    attempt_count   SMALLINT NOT NULL DEFAULT 0,
    notes           TEXT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS da_agent_status_idx  ON delivery_assignments (agent_id, status);
CREATE INDEX IF NOT EXISTS da_shipment_idx      ON delivery_assignments (shipment_id);

CREATE TABLE IF NOT EXISTS delivery_attempts (
    id               BIGSERIAL PRIMARY KEY,
    assignment_id    BIGINT NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE,
    attempt_number   SMALLINT NOT NULL,
    status           VARCHAR(10) NOT NULL DEFAULT 'failed'
                         CHECK (status IN ('success','failed','partial')),
    failure_reason   VARCHAR(255) NULL,
    failure_notes    TEXT NULL,
    attempted_at     TIMESTAMP NOT NULL,
    reattempt_at     TIMESTAMP NULL,
    created_at       TIMESTAMP NULL,
    updated_at       TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS proof_of_deliveries (
    id               BIGSERIAL PRIMARY KEY,
    assignment_id    BIGINT NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE,
    otp_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    otp_hash         VARCHAR(255) NULL,
    recipient_name   VARCHAR(255) NULL,
    signature_url    VARCHAR(255) NULL,
    photo_url        VARCHAR(255) NULL,
    delivery_notes   TEXT NULL,
    delivered_at     TIMESTAMP NOT NULL,
    created_at       TIMESTAMP NULL,
    updated_at       TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS agent_earnings (
    id             BIGSERIAL PRIMARY KEY,
    agent_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id  BIGINT NULL REFERENCES delivery_assignments(id) ON DELETE SET NULL,
    base_pay       DECIMAL(8,2) NOT NULL DEFAULT 0,
    incentive      DECIMAL(8,2) NOT NULL DEFAULT 0,
    deduction      DECIMAL(8,2) NOT NULL DEFAULT 0,
    total          DECIMAL(8,2) GENERATED ALWAYS AS (base_pay + incentive - deduction) STORED,
    period_date    DATE NOT NULL,
    status         VARCHAR(10) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','paid')),
    created_at     TIMESTAMP NULL,
    updated_at     TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS ae_agent_period_idx ON agent_earnings (agent_id, period_date);

-- ── 6. Seed the migrations table so artisan knows these ran ──

INSERT INTO migrations (migration, batch) VALUES
    ('0001_01_01_000000_create_users_table', 1),
    ('0001_01_01_000001_create_cache_table', 1),
    ('0001_01_01_000002_create_jobs_table', 1),
    ('2026_05_12_000001_add_role_fields_to_users', 1),
    ('2026_05_12_000002_create_agent_tables', 1)
ON CONFLICT DO NOTHING;

-- Done ✓
SELECT 'Schema installed successfully' AS status;
