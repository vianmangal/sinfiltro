import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadVideo } from '@/lib/services/videoService';
import { getTodayPrompt, isLateUpload } from '@/lib/services/promptService';

export async function POST(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Idempotency key ─────────────────────────────────────────────────────
    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Missing X-Idempotency-Key header.' },
        { status: 400 },
      );
    }

    // ── Parse multipart form ────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

    // ── Daily prompt / late check ───────────────────────────────────────────
    const prompt = await getTodayPrompt();
    const isLate = isLateUpload(prompt);

    // ── Upload via service ──────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const record = await uploadVideo({
      file: buffer,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      userId: session.user.id,
      idempotencyKey,
      isLate,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
