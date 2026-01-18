-- Create storage bucket for chat media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Storage policies for chat media bucket
CREATE POLICY "Users can upload their own media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to messages table
ALTER TABLE public.messages ADD COLUMN image_url TEXT;

-- Add image_url column to crumbs table
ALTER TABLE public.crumbs ADD COLUMN image_url TEXT;