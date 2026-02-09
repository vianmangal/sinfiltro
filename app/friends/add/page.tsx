'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type FriendRequest = {
  id: number;
  target: string;
  nickname: string;
  createdAt: string;
  status: 'pending';
};

const STORAGE_KEY = 'sinfiltro_friend_requests';

export default function AddFriendPage() {
  const [target, setTarget] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<FriendRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as FriendRequest[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const suggestions = useMemo(
    () => ['maria_87', 'dani.codes', 'noah_streams', 'alex_music'],
    []
  );

  const submitRequest = (e: FormEvent) => {
    e.preventDefault();
    const cleanedTarget = target.trim();
    const cleanedNickname = nickname.trim();

    if (cleanedTarget.length < 3) {
      setError('Enter at least 3 characters for username or email.');
      return;
    }

    const duplicate = requests.some(
      (request) => request.target.toLowerCase() === cleanedTarget.toLowerCase()
    );

    if (duplicate) {
      setError('You already sent a request to this user.');
      return;
    }

    const nextRequest: FriendRequest = {
      id: Date.now(),
      target: cleanedTarget,
      nickname: cleanedNickname,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setRequests((prev) => [nextRequest, ...prev]);
    setTarget('');
    setNickname('');
    setError('');
  };

  const sendQuickRequest = (quickTarget: string) => {
    setTarget(quickTarget);
  };

  const cancelRequest = (id: number) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  return (
    <div className="page">
      <header className="navbar">
        <Link href="/friends" className="back-btn">← Back</Link>
        <h1>Add Friend</h1>
      </header>

      <main className="panel">
        <form className="form" onSubmit={submitRequest}>
          <label htmlFor="target">Username or email</label>
          <input
            id="target"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="friend_username or friend@email.com"
          />

          <label htmlFor="nickname">Nickname (optional)</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="How this friend appears for you"
          />

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" className="submit-btn">Send Request</button>
        </form>

        <section className="suggestions">
          <h2>Quick Add</h2>
          <div className="chips">
            {suggestions.map((name) => (
              <button key={name} onClick={() => sendQuickRequest(name)} type="button">
                + {name}
              </button>
            ))}
          </div>
        </section>

        <section className="requests">
          <h2>Sent Requests</h2>
          {requests.length === 0 ? (
            <p className="empty">No requests sent yet.</p>
          ) : (
            <ul>
              {requests.map((request) => (
                <li key={request.id}>
                  <div>
                    <p>{request.target}</p>
                    <small>
                      {request.nickname ? `Nickname: ${request.nickname}` : 'No nickname'} · Pending
                    </small>
                  </div>
                  <button type="button" onClick={() => cancelRequest(request.id)}>
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #1a1a1a;
          color: #f7f7f7;
          padding: 2rem 1rem;
          font-family: var(--font-poppins), sans-serif;
        }

        .navbar {
          max-width: 860px;
          margin: 0 auto 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f5f5;
          color: #1a1a1a;
          border-radius: 999px;
          padding: 0.9rem 1.4rem;
        }

        .navbar h1 {
          font-size: 1.1rem;
          margin: 0;
        }

        .back-btn {
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 600;
        }

        .panel {
          max-width: 860px;
          margin: 0 auto;
          border-radius: 24px;
          border: 1px solid #343434;
          background: #242424;
          padding: 1.1rem;
          display: grid;
          gap: 1rem;
        }

        .form {
          display: grid;
          gap: 0.55rem;
        }

        .form label {
          font-size: 0.9rem;
          color: #d3d3d3;
        }

        .form input {
          border: 1px solid #3a3a3a;
          border-radius: 10px;
          background: #1a1a1a;
          color: #f7f7f7;
          padding: 0.75rem 0.85rem;
        }

        .error {
          color: #ff8fab;
          font-size: 0.9rem;
          margin: 0.2rem 0;
        }

        .submit-btn {
          margin-top: 0.4rem;
          border: none;
          border-radius: 12px;
          background: #c7ff00;
          color: #181818;
          font-weight: 700;
          padding: 0.75rem 1rem;
          cursor: pointer;
        }

        .suggestions h2,
        .requests h2 {
          margin: 0 0 0.55rem;
          font-size: 1rem;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }

        .chips button {
          border: 1px solid #3c3c3c;
          background: #1a1a1a;
          color: #f7f7f7;
          border-radius: 999px;
          padding: 0.45rem 0.75rem;
          cursor: pointer;
        }

        .requests ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.55rem;
        }

        .requests li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 0.7rem 0.8rem;
          gap: 1rem;
        }

        .requests li p {
          margin: 0;
          font-weight: 600;
        }

        .requests li small {
          color: #9f9f9f;
        }

        .requests li button {
          border: 1px solid #474747;
          background: #252525;
          color: #f4f4f4;
          border-radius: 10px;
          padding: 0.4rem 0.65rem;
          cursor: pointer;
        }

        .empty {
          color: #a6a6a6;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
