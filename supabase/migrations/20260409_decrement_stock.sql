-- Atomic stock deduction to prevent overselling
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INT,
  p_tenant_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Deduct from variant if specified
  IF p_variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET quantity = quantity - p_quantity
    WHERE id = p_variant_id
      AND quantity >= p_quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
    END IF;
  END IF;

  -- Always deduct from product
  UPDATE products
  SET quantity = quantity - p_quantity
  WHERE id = p_product_id
    AND tenant_id = p_tenant_id
    AND quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
