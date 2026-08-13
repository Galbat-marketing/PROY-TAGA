-- Add beneficiario column for non-supplier payments
ALTER TABLE pagos ADD COLUMN beneficiario VARCHAR(200);
