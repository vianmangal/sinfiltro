import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { supabase } from '@/lib/supabase';
import type { CreateUserInput, PublicUser, User } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hashPassword = (password: string, salt: string): string =>
  scryptSync(password, salt, 64).toString('hex');

/** Strip sensitive fields before returning to the client. */
function toPublic(user: User): PublicUser {
  const { password_hash: _h, salt: _s, ...safe } = user;
  return safe;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name || !email || !input.password) {
    throw new Error('Missing required fields.');
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) throw new Error('Email already exists.');

  const salt = randomBytes(16).toString('hex');
  const password_hash = hashPassword(input.password, salt);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email,
      phone: input.phone?.trim() || null,
      password_hash,
      salt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toPublic(data as User);
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const expected = Buffer.from(user.password_hash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');

  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as User) ?? null;
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return toPublic(data as User);
}

export async function searchUsers(query: string, excludeUserId: string): Promise<PublicUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, created_at')
    .neq('id', excludeUserId)
    .ilike('name', `%${query}%`)
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicUser[];
}
