-- Create editor-assets bucket for page builder uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editor-assets',
  'editor-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload editor assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'editor-assets');

-- Allow public read access
CREATE POLICY "Public read access for editor assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'editor-assets');

-- Allow owners to delete their uploads
CREATE POLICY "Users can delete own editor assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'editor-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
