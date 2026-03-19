'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });
      if (res.ok) router.push('/signin');
      else { const d = await res.json(); setError(d.error || 'Registration failed.'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <div className="auth-card fade-in">
        <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: '28px' }}>
          <span className="brand-logo" style={{ fontSize: '1.8rem' }}>
            Sin <span className="brand-accent">Filtro</span>
          </span>
        </Link>

        <h2 style={{ textAlign: 'center', fontSize: '1.05rem', color: 'var(--muted)', marginBottom: '24px', fontWeight: 500 }}>
          Create your account
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="text" placeholder="Full Name" className="input-field"
            value={name} onChange={(e) => setName(e.target.value)}
            required disabled={loading}
          />
          <input
            type="email" placeholder="Email Address" className="input-field"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required disabled={loading}
          />
          <input
            type="tel" placeholder="Phone (optional)" className="input-field"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} placeholder="Create Password" className="input-field"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} disabled={loading}
            />
            <button
              type="button" onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--accent)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Creating…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--muted)', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link href="/signin" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
