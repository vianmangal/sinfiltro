'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

type FeedItem = {
  id: string;
  url: string;
  uploader_name: string;
  is_late: boolean;
  created_at: string;
};

type PromptInfo = {
  prompt: { prompt_time: string; window_end: string };
  fired: boolean;
  canUpload: boolean;
  isLateWindow: boolean;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [promptInfo, setPromptInfo] = useState<PromptInfo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const loadFeed = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/feed');
      if (res.ok) setFeed(await res.json());
    } catch { /* silent */ }
  }, [status]);

  const loadPrompt = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/prompt');
      if (res.ok) setPromptInfo(await res.json());
    } catch { /* silent */ }
  }, [status]);

  useEffect(() => { loadFeed(); loadPrompt(); }, [loadFeed, loadPrompt]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, audio: true,
      });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
        stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordedBlob(null);
      setUploadMsg('');
    } catch (err) { console.error('Camera access denied', err); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const handleUpload = async () => {
    if (!recordedBlob || isSubmitting) return;
    setIsSubmitting(true);
    setUploadMsg('');
    const idempotencyKey = `${session?.user?.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, `recording-${Date.now()}.webm`);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'X-Idempotency-Key': idempotencyKey },
        body: formData,
      });
      if (res.ok) { setUploadMsg('Uploaded!'); setRecordedBlob(null); loadFeed(); }
      else { const d = await res.json(); setUploadMsg(d.error || 'Upload failed.'); }
    } catch { setUploadMsg('Network error.'); }
    finally { setIsSubmitting(false); }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="page-container" style={{ justifyContent: 'center' }}>
        <div className="brand-logo fade-in">Sin <span className="brand-accent">Filtro</span></div>
      </div>
    );
  }

  // ── Landing (unauthenticated) ─────────────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="page-container">
        <div className="landing-hero">
          <div className="brand-logo fade-in">Sin <span className="brand-accent">Filtro</span></div>
          <p className="landing-tagline fade-in stagger-1">
            Share real, unfiltered moments with your closest friends — no likes, no followers, just authentic connection.
          </p>
          <div className="landing-ctas fade-in stagger-2">
            <Link href="/signin" className="btn-primary">Sign In →</Link>
            <Link href="/register" className="btn-outline">Create Account</Link>
          </div>
          <p className="fade-in stagger-3" style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '8px' }}>
            ✦ Free to use · No ads · No algorithms
          </p>
        </div>
      </div>
    );
  }

  // ── Authenticated dashboard ───────────────────────────────────────────────
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container">
      {/* ── Navbar ── */}
      <nav className="navbar fade-in">
        <Link href="/" className="brand-logo" style={{ fontSize: '1.3rem' }}>
          Sin <span className="brand-accent">Filtro</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/friends" className="btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
            👥 Friends
          </Link>
          <button
            onClick={() => signOut()}
            className="btn-outline"
            style={{ fontSize: '0.82rem', padding: '8px 16px', color: '#ff6b6b', borderColor: 'rgba(255,80,80,0.2)' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Prompt Status ── */}
      {promptInfo && (
        <div
          className={`prompt-badge fade-in stagger-1 ${
            !promptInfo.fired ? 'waiting' : promptInfo.canUpload ? 'open' : 'closed'
          }`}
          style={{ marginBottom: '1.5rem', maxWidth: '960px' }}
        >
          {!promptInfo.fired ? (
            <>⏰ Today&apos;s prompt at <strong style={{ color: 'var(--accent)', marginLeft: 4 }}>{new Date(promptInfo.prompt.prompt_time).toLocaleTimeString()}</strong></>
          ) : promptInfo.canUpload ? (
            <>🟢 Window OPEN — record now! Closes at {new Date(promptInfo.prompt.window_end).toLocaleTimeString()}</>
          ) : (
            <>⚠️ Window closed — uploads marked as <span className="late-badge" style={{ marginLeft: 6 }}>LATE</span></>
          )}
        </div>
      )}

      {/* ── Recorder ── */}
      <div className="recorder-card fade-in stagger-2">
        <div className="section-title">
          🎬 Record a moment
        </div>

        <video
          ref={videoRef}
          className="recorder-preview"
          style={{ display: isRecording ? 'block' : 'none' }}
          muted
          playsInline
        />

        {recordedBlob && (
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            style={{ width: '100%', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
          />
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isRecording && !recordedBlob && (
            <button onClick={startRecording} className="btn-primary" style={{ flex: 1 }}>
              Start Recording
            </button>
          )}
          {isRecording && (
            <button onClick={stopRecording} className="btn-stop" style={{ flex: 1 }}>
              ⏹ Stop Recording
            </button>
          )}
          {recordedBlob && (
            <>
              <button onClick={handleUpload} disabled={isSubmitting} className="btn-primary" style={{ flex: 1 }}>
                {isSubmitting ? 'Uploading…' : '📤 Upload'}
              </button>
              <button onClick={() => { setRecordedBlob(null); setUploadMsg(''); }} className="btn-danger">
                Discard
              </button>
            </>
          )}
        </div>

        {uploadMsg && (
          <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.9rem',
            color: uploadMsg === 'Uploaded!' ? 'var(--green)' : '#ff6b6b' }}>
            {uploadMsg}
          </p>
        )}
      </div>

      {/* ── Feed ── */}
      <div style={{ width: '100%', maxWidth: '960px', position: 'relative', zIndex: 1 }}>
        <div className="section-title fade-in stagger-3">
          Friends&apos; moments
          {feed.length > 0 && <span className="count">{feed.length}</span>}
        </div>

        {feed.length === 0 ? (
          <div className="card-surface fade-in stagger-4" style={{ textAlign: 'center', maxWidth: '100%' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              No moments yet. Add friends and start sharing!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {feed.map((item, i) => (
              <div key={item.id} className={`feed-card fade-in stagger-${Math.min(i + 1, 4)}`}>
                <div className="feed-card-header">
                  <div className="feed-card-author">
                    <div className="avatar-circle">{getInitials(item.uploader_name)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.uploader_name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {item.is_late && <span className="late-badge">Late</span>}
                </div>
                <video
                  src={item.url}
                  controls
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
