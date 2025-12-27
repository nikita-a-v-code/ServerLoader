-- Ensure ip_addresses has a default flag and only one can be true
ALTER TABLE "Enforce".ip_addresses
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS ux_ip_addresses_is_default_true
  ON "Enforce".ip_addresses (is_default)
  WHERE is_default = true;
