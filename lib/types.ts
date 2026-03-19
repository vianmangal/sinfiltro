// ─── User ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  salt: string;
  created_at: string;
};

/** Safe subset returned to the client (never expose hash/salt). */
export type PublicUser = Omit<User, 'password_hash' | 'salt'>;

// ─── Video ───────────────────────────────────────────────────────────────────

export type VideoRecord = {
  id: string;
  file_name: string;
  url: string;
  mime_type: string;
  size: number;
  uploaded_by: string;          // FK → users.id  (required, never anonymous)
  idempotency_key?: string;     // prevents duplicate uploads
  is_late: boolean;
  created_at: string;
};

// ─── Friendship ──────────────────────────────────────────────────────────────

export type FriendshipStatus = 'pending' | 'accepted';

export type Friendship = {
  id: string;
  user_id: string;              // sender
  friend_id: string;            // receiver
  status: FriendshipStatus;
  created_at: string;
};

// ─── Daily Prompt ────────────────────────────────────────────────────────────

export type DailyPrompt = {
  id: string;
  date: string;                 // YYYY-MM-DD, unique per day
  prompt_time: string;          // ISO-8601 timestamp when prompt fires
  window_end: string;           // ISO-8601 timestamp when upload window closes
};

// ─── Feed ────────────────────────────────────────────────────────────────────

export type FeedItem = VideoRecord & {
  uploader_name: string;
};

// ─── API helpers ─────────────────────────────────────────────────────────────

export type ApiError = {
  error: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};
