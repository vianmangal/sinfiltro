'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

type Friend = { id: string; name: string; email: string; friendship_id: string; };
type PendingRequest = { id: string; user_id: string; sender_name: string; created_at: string; };
type SearchUser = { id: string; name: string; email: string; };

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.push('/signin'); }, [status, router]);

  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) { const d = await res.json(); setFriends(d.friends ?? []); setPending(d.pending ?? []); }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { if (status === 'authenticated') loadFriends(); }, [status, loadFriends]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/friends?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) { const d = await res.json(); setSearchResults(d.users ?? []); }
    } catch { /* silent */ }
    setSearchLoading(false);
  };

  const sendRequest = async (friendId: string) => {
    setActionMsg('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      if (res.ok) { setActionMsg('Request sent!'); setSearchResults((p) => p.filter((u) => u.id !== friendId)); }
      else { const d = await res.json(); setActionMsg(d.error || 'Failed.'); }
    } catch { setActionMsg('Network error.'); }
  };

  const acceptRequest = async (id: string) => { await fetch(`/api/friends/${id}`, { method: 'PATCH' }); loadFriends(); };
  const rejectRequest = async (id: string) => { await fetch(`/api/friends/${id}`, { method: 'DELETE' }); loadFriends(); };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="page-container" style={{ justifyContent: 'center' }}>
        <div className="brand-logo fade-in">Sin <span className="brand-accent">Filtro</span></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ── Navbar ── */}
      <nav className="navbar fade-in">
        <Link href="/" className="btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
          ← Back
        </Link>
        <span className="brand-logo" style={{ fontSize: '1.3rem' }}>
          Sin <span className="brand-accent">Filtro</span>
        </span>
        <div style={{ width: '70px' }} />
      </nav>

      {/* ── Search ── */}
      <div className="card-surface fade-in stagger-1" style={{ maxWidth: '640px', marginBottom: '20px' }}>
        <div className="section-title">🔍 Find Friends</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text" placeholder="Search by name…" className="input-field"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary"
            style={{ width: 'auto', padding: '14px 24px' }} disabled={searchLoading}>
            {searchLoading ? '…' : 'Search'}
          </button>
        </div>

        {actionMsg && (
          <p style={{ marginTop: '12px', fontSize: '0.88rem',
            color: actionMsg.includes('sent') || actionMsg.includes('Request') ? 'var(--green)' : '#ff6b6b' }}>
            {actionMsg}
          </p>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchResults.map((user) => (
              <div key={user.id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{getInitials(user.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{user.email}</div>
                  </div>
                </div>
                <button onClick={() => sendRequest(user.id)} className="btn-accept">Add</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending ── */}
      {pending.length > 0 && (
        <div className="card-surface fade-in stagger-2" style={{ maxWidth: '640px', marginBottom: '20px' }}>
          <div className="section-title">
            📬 Pending Requests <span className="count">{pending.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map((req) => (
              <div key={req.id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{getInitials(req.sender_name)}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.sender_name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => acceptRequest(req.id)} className="btn-accept">Accept</button>
                  <button onClick={() => rejectRequest(req.id)} className="btn-danger">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Friend List ── */}
      <div className="card-surface fade-in stagger-3" style={{ maxWidth: '640px' }}>
        <div className="section-title">
          👥 My Friends <span className="count">{friends.length}</span>
        </div>
        {friends.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>No friends yet — search above to add some!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {friends.map((f) => (
              <div key={f.friendship_id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{getInitials(f.name)}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{f.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
