import { supabase } from '@/lib/supabase';
import type { VideoRecord, FeedItem } from '@/lib/types';

// ─── Upload ──────────────────────────────────────────────────────────────────

export async function uploadVideo(input: {
  file: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  idempotencyKey: string;
  isLate: boolean;
}): Promise<VideoRecord> {
  // ── Idempotency check ────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('videos')
    .select('*')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();

  if (existing) return existing as VideoRecord; // already uploaded

  // ── Upload file to Supabase Storage ──────────────────────────────────────
  const storagePath = `${input.userId}/${input.fileName}`;
  const { error: storageError } = await supabase.storage
    .from('videos')
    .upload(storagePath, input.file, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`);

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // ── Insert DB record ─────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('videos')
    .insert({
      file_name: input.fileName,
      url: publicUrl,
      mime_type: input.mimeType,
      size: input.size,
      uploaded_by: input.userId,
      idempotency_key: input.idempotencyKey,
      is_late: input.isLate,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VideoRecord;
}

// ─── Feed ────────────────────────────────────────────────────────────────────

/**
 * Fetch videos uploaded by the user's accepted friends, ordered newest-first.
 */
export async function getFriendsFeed(userId: string): Promise<FeedItem[]> {
  // Step 1: get list of accepted friend IDs
  const { data: friendships, error: fErr } = await supabase
    .from('friendships')
    .select('user_id, friend_id')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (fErr) throw new Error(fErr.message);

  const friendIds = (friendships ?? []).map((f) =>
    f.user_id === userId ? f.friend_id : f.user_id,
  );

  if (friendIds.length === 0) return [];

  // Step 2: fetch videos by those friends
  const { data: videos, error: vErr } = await supabase
    .from('videos')
    .select('*, users!uploaded_by(name)')
    .in('uploaded_by', friendIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (vErr) throw new Error(vErr.message);

  return (videos ?? []).map((v) => ({
    ...v,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploader_name: (v as any).users?.name ?? 'Unknown',
  })) as FeedItem[];
}

// ─── User's own videos ──────────────────────────────────────────────────────

export async function getVideosByUser(userId: string): Promise<VideoRecord[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as VideoRecord[];
}
