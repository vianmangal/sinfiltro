import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type VideoRecord = {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
};

type BackendDb = {
  users: UserRecord[];
  videos: VideoRecord[];
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'backend.json');

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString('hex');

async function ensureDb(): Promise<BackendDb> {
  await mkdir(DB_DIR, { recursive: true });
  try {
    const file = await readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(file) as Partial<BackendDb>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
    };
  } catch {
    const initial: BackendDb = { users: [], videos: [] };
    await writeFile(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function writeDb(db: BackendDb) {
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const db = await ensureDb();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name || !email || !input.password) {
    throw new Error('Missing required fields.');
  }

  if (db.users.some((user) => user.email === email)) {
    throw new Error('Email already exists.');
  }

  const salt = randomBytes(16).toString('hex');
  const user: UserRecord = {
    id: randomUUID(),
    name,
    email,
    phone: input.phone?.trim() || undefined,
    salt,
    passwordHash: hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDb(db);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export async function findUserByEmail(email: string) {
  const db = await ensureDb();
  return db.users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

export async function verifyUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  return user;
}

export async function saveVideoRecord(input: {
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy?: string;
}) {
  const db = await ensureDb();
  const record: VideoRecord = {
    id: randomUUID(),
    fileName: input.fileName,
    url: input.url,
    mimeType: input.mimeType,
    size: input.size,
    uploadedBy: input.uploadedBy ?? 'anonymous',
    createdAt: new Date().toISOString(),
  };
  db.videos.push(record);
  await writeDb(db);
  return record;
}
