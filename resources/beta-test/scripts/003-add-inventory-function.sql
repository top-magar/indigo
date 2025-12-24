-- Function to decrement product quantity (for order processing)
CREATE OR REPLACE FUNCTION decrement_product_quantity(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET quantity = GREATEST(0, quantity - p_quantity)
  WHERE id = p_product_id AND track_quantity = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
