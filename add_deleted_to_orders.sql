-- Add deleted column to orders table
-- This column will track if an order has been marked as deleted

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Add a comment to the column for documentation
COMMENT ON COLUMN orders.deleted IS 'Indicates if the order has been marked as deleted (soft delete)';

-- Optional: Create an index for better query performance when filtering deleted orders
CREATE INDEX IF NOT EXISTS idx_orders_deleted ON orders(deleted);
