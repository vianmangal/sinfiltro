import { supabase } from '@/lib/supabase';
import type { DailyPrompt } from '@/lib/types';

// ─── Default window duration (2 minutes) ────────────────────────────────────
const WINDOW_MINUTES = 2;

// ─── Get or create today's prompt ────────────────────────────────────────────

export async function getTodayPrompt(): Promise<DailyPrompt> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: existing } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (existing) return existing as DailyPrompt;

  // Generate a random prompt time for today (between 10:00 and 20:00 UTC)
  const hour = 10 + Math.floor(Math.random() * 10);   // 10–19
  const minute = Math.floor(Math.random() * 60);

  const promptTime = new Date(`${today}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`);
  const windowEnd = new Date(promptTime.getTime() + WINDOW_MINUTES * 60 * 1000);

  const { data, error } = await supabase
    .from('daily_prompts')
    .insert({
      date: today,
      prompt_time: promptTime.toISOString(),
      window_end: windowEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    // Race condition: another request already created it
    const { data: retry } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('date', today)
      .single();
    if (retry) return retry as DailyPrompt;
    throw new Error(error.message);
  }

  return data as DailyPrompt;
}

// ─── Check window status ─────────────────────────────────────────────────────

export function isWithinWindow(prompt: DailyPrompt): boolean {
  const now = Date.now();
  const start = new Date(prompt.prompt_time).getTime();
  const end = new Date(prompt.window_end).getTime();
  return now >= start && now <= end;
}

export function hasPromptFired(prompt: DailyPrompt): boolean {
  return Date.now() >= new Date(prompt.prompt_time).getTime();
}

/**
 * Returns true if the current upload should be marked as late.
 * Late = prompt has fired but the window has already closed.
 */
export function isLateUpload(prompt: DailyPrompt): boolean {
  const now = Date.now();
  const start = new Date(prompt.prompt_time).getTime();
  const end = new Date(prompt.window_end).getTime();
  return now >= start && now > end;
}
