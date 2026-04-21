'use server';

import { createClient } from '@/infrastructure/supabase/server';
import { requireUser } from '@/lib/auth';

const BUCKET = 'editor-assets';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']);

export async function uploadEditorAsset(formData: FormData): Promise<{ url: string } | { error: string }> {
  const user = await requireUser();
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided' };
  if (!ALLOWED_TYPES.has(file.type)) return { error: 'File type not allowed. Use JPEG, PNG, WebP, GIF, SVG, or MP4.' };
  if (file.size > MAX_SIZE) return { error: 'File too large. Maximum 5MB.' };

  const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4' };
  const ext = extMap[file.type] || 'bin';
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
