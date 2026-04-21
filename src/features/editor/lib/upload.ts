'use server';

import { createClient } from '@/infrastructure/supabase/server';
import { requireUser } from '@/lib/auth';

const BUCKET = 'editor-assets';

export async function uploadEditorAsset(formData: FormData): Promise<{ url: string } | { error: string }> {
  const user = await requireUser();
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided' };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
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
