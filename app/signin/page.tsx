'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password.');
      else if (result?.ok) router.push('/');
    } catch { setError('An error occurred. Please try again.'); }
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
          Welcome back
        </h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="email" placeholder="Email Address" className="input-field"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required disabled={loading}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} placeholder="Password" className="input-field"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={loading}
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
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--muted)', fontSize: '0.88rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
