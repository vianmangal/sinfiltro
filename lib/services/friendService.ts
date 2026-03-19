import { supabase } from '@/lib/supabase';
import type { Friendship, PublicUser } from '@/lib/types';

// ─── Send ────────────────────────────────────────────────────────────────────

export async function sendFriendRequest(
  userId: string,
  friendId: string,
): Promise<Friendship> {
  if (userId === friendId) throw new Error('Cannot friend yourself.');

  // Check for existing friendship in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`,
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') throw new Error('Already friends.');
    throw new Error('Friend request already pending.');
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Friendship;
}

// ─── Accept ──────────────────────────────────────────────────────────────────

export async function acceptFriendRequest(
  userId: string,
  requestId: string,
): Promise<Friendship> {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('friend_id', userId)           // only the receiver can accept
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw new Error('Request not found or already handled.');
  return data as Friendship;
}

// ─── Reject ──────────────────────────────────────────────────────────────────

export async function rejectFriendRequest(
  userId: string,
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', requestId)
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error) throw new Error('Request not found or already handled.');
}

// ─── List accepted friends ───────────────────────────────────────────────────

export async function getFriendList(
  userId: string,
): Promise<(PublicUser & { friendship_id: string })[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_id, friend_id, users_sender:users!user_id(id, name, email, created_at), users_receiver:users!friend_id(id, name, email, created_at)')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const friend =
      row.user_id === userId ? row.users_receiver : row.users_sender;
    return { ...friend, friendship_id: row.id };
  });
}

// ─── Pending incoming requests ───────────────────────────────────────────────

export async function getPendingRequests(
  userId: string,
): Promise<(Friendship & { sender_name: string })[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, users!user_id(name)')
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    sender_name: row.users?.name ?? 'Unknown',
  }));
}
