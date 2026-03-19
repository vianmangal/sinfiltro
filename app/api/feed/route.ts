import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getFriendsFeed } from '@/lib/services/videoService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feed = await getFriendsFeed(session.user.id);
    return NextResponse.json(feed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load feed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
