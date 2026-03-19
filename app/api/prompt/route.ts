import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTodayPrompt, isWithinWindow, hasPromptFired } from '@/lib/services/promptService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompt = await getTodayPrompt();
    const fired = hasPromptFired(prompt);
    const withinWindow = isWithinWindow(prompt);

    return NextResponse.json({
      prompt,
      fired,
      canUpload: withinWindow,
      isLateWindow: fired && !withinWindow,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get prompt.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
