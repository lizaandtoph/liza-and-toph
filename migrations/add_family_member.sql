-- Migration: Add page.chris27@gmail.com as family member to cpm@lizaandtoph.com's child
-- Purpose: Grant access to Topher's playboard for the second parent

-- Step 1: Preview what will be created (run this first to verify)
-- Uncomment to see what will happen:
-- SELECT 
--   cp.id as child_id,
--   cp.name as child_name,
--   u1.email as owner_email,
--   u2.email as new_family_member_email
-- FROM child_profiles cp
-- JOIN users u1 ON cp.user_id = u1.id
-- CROSS JOIN users u2
-- WHERE u1.email = 'cpm@lizaandtoph.com'
--   AND u2.email = 'page.chris27@gmail.com';

-- Step 2: Add page.chris27@gmail.com as editor for all children owned by cpm@lizaandtoph.com
INSERT INTO user_child_links (user_id, child_id, role, invited_by, created_at)
SELECT 
  u2.id as user_id,
  cp.id as child_id,
  'editor' as role,
  u1.id as invited_by,
  NOW() as created_at
FROM child_profiles cp
JOIN users u1 ON cp.user_id = u1.id
CROSS JOIN users u2
WHERE u1.email = 'cpm@lizaandtoph.com'
  AND u2.email = 'page.chris27@gmail.com'
  AND NOT EXISTS (
    -- Don't create duplicate links
    SELECT 1 FROM user_child_links ucl
    WHERE ucl.user_id = u2.id AND ucl.child_id = cp.id
  );

-- Step 3: Verify the family member was added (run after the insert)
-- Uncomment to verify:
-- SELECT 
--   u.email as user_email,
--   cp.name as child_name,
--   ucl.role,
--   inviter.email as invited_by_email,
--   ucl.created_at
-- FROM user_child_links ucl
-- JOIN users u ON ucl.user_id = u.id
-- JOIN child_profiles cp ON ucl.child_id = cp.id
-- LEFT JOIN users inviter ON ucl.invited_by = inviter.id
-- WHERE cp.id IN (
--   SELECT cp2.id 
--   FROM child_profiles cp2
--   JOIN users u2 ON cp2.user_id = u2.id
--   WHERE u2.email = 'cpm@lizaandtoph.com'
-- )
-- ORDER BY cp.name, ucl.role DESC;
