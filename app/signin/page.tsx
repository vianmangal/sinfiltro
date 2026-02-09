'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="viewport-container">
      <div className="auth-card">
        <Link href="/" className="logo-link">
          <span className="logo-text">Sin<span className="accent">Filtro</span></span>
        </Link>
        
        <h2 className="subtitle">Welcome Back</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSignIn}>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          
          <div className="input-group password-group">
            <input 
              type={show ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
            <button 
              type="button" 
              className="toggle-visibility"
              onClick={() => setShow(!show)}
              disabled={loading}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            New here? <Link href="/register" className="footer-link">Create Account</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .viewport-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111111;
          font-family: var(--font-poppins), sans-serif;
        }

        .auth-card {
          background: #1e1e1e;
          padding: 3.5rem 2.5rem;
          border-radius: 40px;
          border: 1px solid #333;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .logo-text {
          font-family: var(--font-archivo), sans-serif;
          font-size: 1.8rem;
          color: white;
        }

        .logo-link {
          display: inline-block;
        }

        .accent {
          border-bottom: 3px solid #C7FF00;
          margin-left: 2px;
        }

        .subtitle {
          color: #888;
          font-weight: 400;
          font-size: 1.1rem;
          margin: 0.5rem 0 2.5rem 0;
        }

        .error-message {
          background: rgba(255, 20, 147, 0.15);
          border: 1px solid #FF1493;
          color: #FF69B4;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-group {
          margin-bottom: 1.2rem;
          position: relative;
        }

        input {
          width: 100%;
          padding: 1.1rem 1.2rem;
          background: #121212;
          border: 1px solid #333;
          border-radius: 18px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s, opacity 0.3s;
        }

        input:focus {
          border-color: #C7FF00;
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .toggle-visibility {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #C7FF00;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.3s;
        }

        .toggle-visibility:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signin-btn {
          width: 100%;
          padding: 1.1rem;
          background: white;
          color: black;
          border: none;
          border-radius: 18px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .signin-btn:hover:not(:disabled) {
          background: #C7FF00;
          transform: translateY(-2px);
        }

        .signin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 1.5rem;
          color: #888;
          font-size: 0.95rem;
        }

        .footer-link {
          color: #C7FF00;
          font-weight: 600;
          margin-left: 5px;
        }
      `}</style>
    </div>
  );
}
