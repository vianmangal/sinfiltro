import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  sendFriendRequest,
  getFriendList,
  getPendingRequests,
} from '@/lib/services/friendService';
import { searchUsers } from '@/lib/services/authService';

// GET /api/friends — list friends + pending requests
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    // If a search query is provided, return matching users
    if (search) {
      const users = await searchUsers(search, session.user.id);
      return NextResponse.json({ users });
    }

    const [friends, pending] = await Promise.all([
      getFriendList(session.user.id),
      getPendingRequests(session.user.id),
    ]);

    return NextResponse.json({ friends, pending });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load friends.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/friends — send friend request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'friendId is required.' }, { status: 400 });
    }

    const friendship = await sendFriendRequest(session.user.id, friendId);
    return NextResponse.json(friendship, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
