'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: add registration API call or validation
    router.push('/');
  };

  return (
    <>
      <div className="viewport-wrapper">
        <div className="auth-card">
          <Link href="/" className="logo-container">
            <h1 className="brand-title">
              Sin <span className="underline-text">Filtro</span>
            </h1>
          </Link>
          
          <p className="welcome-text">Register Now</p>
          
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input type="text" placeholder="Full Name" required />
            </div>

            <div className="input-group">
              <input type="email" placeholder="Email Address" required />
            </div>

            <div className="input-group">
              <input 
                type="tel" 
                placeholder="Phone Number" 
                pattern="[0-9]{10}" 
                required 
              />
            </div>
            
            <div className="pass-wrap">
              <input 
                type={show ? "text" : "password"} 
                placeholder="Create Password" 
                required 
              />
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => setShow(!show)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            
            <button type="submit" className="submit-btn">
              Register
            </button>
          </form>
          
          <div className="footer">
            <p>
              Already a member? <Link href="/signin" className="footer-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .viewport-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          background: #121212;
        }

        .auth-card {
          background: #1e1e1e;
          padding: 2.5rem 2.2rem;
          border-radius: 35px;
          border: 1px solid #333;
          text-align: center;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          color: white;
        }

        .logo-container {
          text-decoration: none;
          display: inline-block;
        }

        .brand-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: white;
          margin: 0;
        }

        .underline-text {
          position: relative;
          display: inline-block;
        }

        .underline-text::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -5px;
          width: 100%;
          height: 5px;
          background-color: #C7FF00;
          border-radius: 2px;
        }

        .welcome-text {
          font-size: 1.2rem;
          color: #888;
          margin: 1.2rem 0 1.8rem 0;
          font-weight: 400;
        }

        .input-group, .pass-wrap {
          margin-bottom: 0.8rem;
          width: 100%;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.9rem 1.2rem;
          border-radius: 15px;
          border: 1px solid #333;
          background: #121212;
          color: white;
          font-size: 0.95rem;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #C7FF00;
        }

        .pass-wrap {
          position: relative;
        }

        .toggle-btn {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #C7FF00;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 15px;
          border: none;
          background: white;
          color: black;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 0.8rem;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          background: #C7FF00;
          transform: scale(1.02);
        }

        .footer {
          margin-top: 1.2rem;
          font-size: 0.85rem;
          color: #888;
        }

        .footer-link {
          color: #C7FF00;
          font-weight: 600;
          margin-left: 5px;
        }
      `}</style>
    </>
  );
}
