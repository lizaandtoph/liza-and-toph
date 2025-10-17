-- Migration: Backfill user_child_links for existing children
-- Purpose: Create owner links for all children that don't have them yet
-- This fixes the issue where children don't appear in user accounts after family sharing implementation

-- Step 1: Check how many children need links (for verification)
-- Uncomment to run this first to see what will be created:
-- SELECT cp.id, cp.name, cp.user_id, u.email
-- FROM child_profiles cp
-- JOIN users u ON cp.user_id = u.id
-- LEFT JOIN user_child_links ucl ON cp.id = ucl.child_id
-- WHERE ucl.id IS NULL;

-- Step 2: Create owner links for all children without them
INSERT INTO user_child_links (user_id, child_id, role, invited_by, created_at)
SELECT 
  cp.user_id,
  cp.id,
  'owner',
  NULL,
  NOW()
FROM child_profiles cp
LEFT JOIN user_child_links ucl ON cp.id = ucl.child_id
WHERE ucl.id IS NULL;

-- Step 3: Verify the migration (run after the insert to confirm)
-- Uncomment to verify:
-- SELECT 
--   u.email,
--   cp.name as child_name,
--   ucl.role,
--   ucl.created_at
-- FROM user_child_links ucl
-- JOIN child_profiles cp ON ucl.child_id = cp.id
-- JOIN users u ON ucl.user_id = u.id
-- ORDER BY u.email, cp.name;
