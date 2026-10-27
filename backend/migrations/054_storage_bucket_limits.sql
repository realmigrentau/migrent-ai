-- 054: storage buckets that had no limits (2026-10-27)
--
-- `attachments` was a public bucket with no size or type limit: anything put
-- in it could be fetched by anyone who had the address, and nothing stopped
-- a huge file or a web page being stored there. No code uses it any more
-- (message attachments live in the private `message-attachments` bucket,
-- read through short-lived signed links) and it is empty, so it becomes
-- private with the same limits as message-attachments.
--
-- `owner-id-docs` holds government ID documents. It was already private but
-- took any size and any type; the API only ever stores JPEG, PNG, WebP, GIF
-- or PDF up to 10 MB (routes_owner_verification.py), so the bucket now
-- refuses anything else as well.
--
-- Uploads go through the API with the service role; there are no storage
-- policies for anon or signed-in users (052), so this changes nothing a
-- person can do directly.

UPDATE storage.buckets
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
WHERE id = 'attachments';

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
WHERE id = 'owner-id-docs';
