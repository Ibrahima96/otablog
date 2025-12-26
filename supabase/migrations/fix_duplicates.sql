-- FIX DUPLICATE LIKES & COMMENTS
-- 1. Remove duplicate likes (keeping the oldest one)
DELETE FROM post_likes
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY user_id, post_id ORDER BY created_at) as rnum
        FROM post_likes
    ) t
    WHERE t.rnum > 1
);

-- 2. Add Unique Constraint to prevent future duplicates
ALTER TABLE post_likes
ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id);

-- 3. (Optional) Check for duplicate comments if needed, but comments might be allowed multiple times.
-- For now, we trust likes are the main "count" issue.

-- 4. Verify count
SELECT post_id, COUNT(*) as real_likes
FROM post_likes
GROUP BY post_id;
