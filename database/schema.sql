-- ============================================================
--  Base de datos — Landing / Sistema integral (PostgreSQL)
--  Modelo orientado a documentos (JSONB) + vistas de reporte.
--  Ejecutar:  psql "$DATABASE_URL" -f database/schema.sql
-- ============================================================

-- Tabla principal: cada "colección" es una fila con su documento JSONB.
-- Colecciones transaccionales: demos, subscriptions, chat_leads, users, cron_log
CREATE TABLE IF NOT EXISTS app_documents (
  key         TEXT PRIMARY KEY,
  data        JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice GIN para consultas dentro del JSONB (búsquedas/reportes)
CREATE INDEX IF NOT EXISTS idx_app_documents_data ON app_documents USING GIN (data);

-- ============================================================
--  Vistas de reporte (expanden los documentos a filas)
--  Útiles para BI, dashboards externos o consultas SQL directas.
-- ============================================================

-- Demos / leads solicitados
CREATE OR REPLACE VIEW v_demos AS
SELECT
  e->>'id'           AS id,
  e->>'name'         AS name,
  e->>'email'        AS email,
  e->>'phone'        AS phone,
  e->>'company'      AS company,
  e->>'productId'    AS product_id,
  e->>'productName'  AS product_name,
  e->>'status'       AS status,
  (e->>'createdAt')::timestamptz AS created_at,
  (e->>'expiresAt')::timestamptz AS expires_at
FROM app_documents d
CROSS JOIN LATERAL jsonb_array_elements(d.data) AS e
WHERE d.key = 'demos';

-- Suscripciones / contrataciones
CREATE OR REPLACE VIEW v_subscriptions AS
SELECT
  e->>'id'          AS id,
  e->>'name'        AS name,
  e->>'email'       AS email,
  e->>'company'     AS company,
  e->>'productId'   AS product_id,
  e->>'productName' AS product_name,
  e->>'plan'        AS plan,
  (e->>'amount')::numeric AS amount,
  e->>'promoCode'   AS promo_code,
  e->>'paymentMethod' AS payment_method,
  e->>'status'      AS status,
  (e->>'accessEnabled')::boolean AS access_enabled,
  e->>'gateway'     AS gateway,
  e->>'paymentStatus' AS payment_status,
  (e->>'createdAt')::timestamptz AS created_at,
  NULLIF(e->>'activatedAt','')::timestamptz AS activated_at
FROM app_documents d
CROSS JOIN LATERAL jsonb_array_elements(d.data) AS e
WHERE d.key = 'subscriptions';

-- Leads captados por el chat IA
CREATE OR REPLACE VIEW v_chat_leads AS
SELECT
  e->>'id'        AS id,
  e->>'email'     AS email,
  e->>'phone'     AS phone,
  e->>'interest'  AS interest,
  (e->>'firstSeen')::timestamptz AS first_seen
FROM app_documents d
CROSS JOIN LATERAL jsonb_array_elements(d.data) AS e
WHERE d.key = 'chat_leads';

-- Ingresos mensuales de suscripciones activas (reporte rápido)
CREATE OR REPLACE VIEW v_revenue_by_product AS
SELECT product_name, count(*) AS clientes, sum(amount) AS ingresos
FROM v_subscriptions
WHERE status = 'active'
GROUP BY product_name
ORDER BY ingresos DESC;
