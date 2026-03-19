import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/lib/services/friendService';

// PATCH /api/friends/[id] — accept friend request
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const friendship = await acceptFriendRequest(session.user.id, id);
    return NextResponse.json(friendship);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Accept failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/friends/[id] — reject friend request
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await rejectFriendRequest(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reject failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
