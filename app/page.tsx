'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";

export default function SinFiltroPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('theme') !== 'light';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        setMousePosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 640 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --neon-green: #C7FF00;
          --hot-pink: #FF1493;
          --electric-blue: #00D9FF;
          --deep-purple: #1A0A2E;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        html, body {
          height: 100%;
          overflow-x: hidden;
        }

        body {
          font-family: var(--font-poppins), sans-serif;
          background: ${isDark 
            ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.5s ease;
        }

        @media (hover: none) and (pointer: coarse) {
          .card:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="container">
        <header className="header">
          
          <Link href="/friends">
            <button className="friends-section">
              <span className="friends-text">Friends</span>
            </button>
          </Link>
          
          <div className="logo">
            <span className="logo-sin">Sin</span>
            <span className="logo-filtro">Filtro</span>
          </div>
          
          <div className="nav-right">
            <div className="auth-buttons">
              <Link href="/signin">
                <button className="auth-btn">Sign In</button>
              </Link>
              
              <Link href="/register">
                <button className="auth-btn">Register</button>
              </Link>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="currentColor"/>
                  <path d="M12 1v6m0 6v6m11-6h-6m-6 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <div className={`menu-icon ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} role="button">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
              <Link href="/signin">
                <button onClick={() => setMenuOpen(false)}>Sign In</button>
              </Link>
              <Link href="/register">
                <button onClick={() => setMenuOpen(false)}>Register</button>
              </Link>
            </div>
          </div>
        </header>

        <div className="content">
          <div 
            className="card card-left"
            style={!isMobile ? {
              transform: `translate(${(mousePosition.x - 0.5) * 5}px, ${(mousePosition.y - 0.5) * 5}px)`
            } : {}}
          >
            <div className="online-badge">
              <span className="badge-text">Online</span>
            </div>
            <div className="card-glow glow-pink"></div>
          </div>
          
          <div 
            className="card card-right"
            style={!isMobile ? {
              transform: `translate(${(mousePosition.x - 0.5) * 10}px, ${(mousePosition.y - 0.5) * 10}px)`
            } : {}}
          >
            <div className="card-glow glow-blue"></div>
          </div>
        </div>
      </div>
              

      <style jsx>{`
        .container {
          width: 100%;
          max-width: 1400px;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDark
            ? `radial-gradient(circle at 20% 50%, rgba(199, 255, 0, 0.03) 0%, transparent 50%),
               radial-gradient(circle at 80% 30%, rgba(255, 20, 147, 0.03) 0%, transparent 50%),
               radial-gradient(circle at 50% 70%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 50%, rgba(199, 255, 0, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 80% 30%, rgba(255, 20, 147, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 50% 70%, rgba(0, 217, 255, 0.05) 0%, transparent 50%)`
          };
          pointer-events: none;
          z-index: 0;
          transition: background 0.5s ease;
        }

        .header {
          background: ${isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(230, 230, 230, 0.95))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 247, 250, 0.98))'
          };
          border-radius: 50px;
          padding: 1.5rem 3rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          justify-items: left;
          align-items: left;
          margin-bottom: 2rem;
          box-shadow: ${isDark
            ? `0 10px 30px rgba(0, 0, 0, 0.3),
               0 0 0 2px rgba(199, 255, 0, 0.2),
               inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 10px 30px rgba(0, 0, 0, 0.08),
               0 0 0 2px rgba(199, 255, 0, 0.15),
               inset 0 1px 0 rgba(255, 255, 255, 1)`
          };
          animation: slideDown 0.6s ease-out;
          position: relative;
          z-index: 10;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .friends-section {
          justify-self: start;
          background: transparent;
          border: 2px solid transparent;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .friends-section::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(199, 255, 0, 0.2), rgba(255, 20, 147, 0.2));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .friends-section:hover {
          border-color: var(--neon-green);
          transform: translateX(5px);
        }

        .friends-section:hover::before {
          opacity: 1;
        }

        .friends-section:active {
          transform: translateX(5px) scale(0.98);
        }

        .friends-text {
          font-family: var(--font-poppins), sans-serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: ${isDark ? '#1a1a1a' : '#2d3748'};
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
        }

        .friends-section:hover .friends-text {
          color: var(--hot-pink);
        }

        .logo {
          font-family: var(--font-archivo), sans-serif;
          font-size: 2.5rem;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          position: relative;
        }

        .logo-sin {
          color: ${isDark ? '#1a1a1a' : '#1a202c'};
          transition: color 0.3s ease;
        }

        .logo-filtro {
          color: ${isDark ? '#1a1a1a' : '#1a202c'};
          position: relative;
          transition: color 0.3s ease;
        }

        .logo-filtro::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--hot-pink), var(--neon-green));
          border-radius: 2px;
        }

        .nav-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.5rem;
          justify-self: end;
        }

        .auth-buttons {
          display: flex;
          gap: 1.5rem;
        }

        .auth-btn {
          font-family: var(--font-poppins), sans-serif;
          font-size: 1rem;
          font-weight: 600;
          background: ${isDark ? 'transparent' : 'rgba(199, 255, 0, 0.1)'};
          border: ${isDark ? 'none' : '1px solid rgba(199, 255, 0, 0.3)'};
          color: ${isDark ? '#1a1a1a' : '#111827'};
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          padding: ${isDark ? '0.5rem 0' : '0.6rem 1rem'};
          border-radius: ${isDark ? '0' : '8px'};
        }

        .auth-btn:hover {
          background: ${isDark ? 'transparent' : 'rgba(199, 255, 0, 0.2)'};
          transform: ${isDark ? 'none' : 'translateY(-2px)'};
        }

        .auth-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--hot-pink), var(--neon-green));
          transition: width 0.3s ease;
          display: ${isDark ? 'block' : 'none'};
        }

        .auth-btn:hover::after {
          width: ${isDark ? '100%' : '0'};
        }

        .auth-btn:active {
          opacity: 0.7;
        }

        .theme-toggle {
          background: ${isDark 
            ? 'rgba(0, 0, 0, 0.1)' 
            : 'rgba(199, 255, 0, 0.15)'
          };
          border: 2px solid ${isDark 
            ? 'rgba(0, 0, 0, 0.15)' 
            : 'rgba(199, 255, 0, 0.3)'
          };
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: ${isDark ? '#1a1a1a' : '#2d3748'};
        }

        .theme-toggle:hover {
          background: ${isDark 
            ? 'rgba(199, 255, 0, 0.2)' 
            : 'rgba(199, 255, 0, 0.25)'
          };
          transform: rotate(180deg) scale(1.1);
          border-color: var(--neon-green);
        }

        .theme-toggle:active {
          transform: rotate(180deg) scale(0.95);
        }

        .menu-icon {
          display: none;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .menu-icon:hover {
          transform: scale(1.1);
        }

        .menu-icon:active {
          transform: scale(0.95);
        }

        .menu-icon span {
          width: 35px;
          height: 4px;
          background: ${isDark ? '#1a1a1a' : '#2d3748'};
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .menu-icon:hover span:nth-child(1) {
          transform: translateX(5px);
          background: var(--hot-pink);
        }

        .menu-icon:hover span:nth-child(2) {
          background: var(--neon-green);
        }

        .menu-icon:hover span:nth-child(3) {
          transform: translateX(-5px);
          background: var(--electric-blue);
        }

        .menu-icon.open span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
          width: 28px;
        }

        .menu-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .menu-icon.open span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
          width: 28px;
        }

        /* Mobile menu */
        .mobile-menu {
          display: none;
        }

        @media (max-width: 640px) {
          .auth-buttons { display: none; }

          .menu-icon { display: flex; }

          .mobile-menu {
            display: none;
            position: absolute;
            right: 1.5rem;
            top: 100%;
            margin-top: 0.6rem;
            width: 200px;
            background: ${isDark ? 'rgba(26,26,26,0.98)' : 'rgba(255,255,255,0.98)'};
            border-radius: 12px;
            padding: 0.5rem;
            box-shadow: ${isDark
              ? '0 12px 40px rgba(0,0,0,0.45)'
              : '0 8px 24px rgba(0,0,0,0.12)'};
            flex-direction: column;
            gap: 0.5rem;
            z-index: 30;
            transform-origin: top right;
            transform: scale(0.98);
            transition: opacity 160ms ease, transform 160ms ease;
            opacity: 0;
          }

          .mobile-menu.open {
            display: flex;
            opacity: 1;
            transform: scale(1);
          }

          .mobile-menu a button {
            width: 100%;
            text-align: left;
            padding: 0.8rem 1rem;
            border-radius: 10px;
            background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
            border: 1px solid rgba(255,255,255,0.04);
            font-weight: 700;
            color: ${isDark ? '#ffffff' : '#111827'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 120ms ease, background 120ms ease;
          }

          .mobile-menu a button:hover {
            transform: translateY(-3px);
            background: ${isDark ? 'linear-gradient(90deg, rgba(199,255,0,0.06), rgba(255,20,147,0.04))' : 'rgba(0,0,0,0.04)'};
          }
        }

        .content {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 2rem;
          position: relative;
          z-index: 5;
        }

        .card {
          border-radius: 40px;
          background: ${isDark
            ? `linear-gradient(to bottom, 
                rgba(226, 232, 240, 0.95) 0%, 
                rgba(42, 42, 42, 0.95) 100%)`
            : `linear-gradient(to bottom,
                rgba(255, 255, 255, 0.98) 0%,
                rgba(226, 232, 240, 0.95) 100%)`
          };
          padding: 2rem;
          min-height: 500px;
          height: 60vh;
          max-height: 700px;
          box-shadow: ${isDark
            ? `0 20px 60px rgba(0, 0, 0, 0.4),
               inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            : `0 20px 60px rgba(0, 0, 0, 0.1),
               inset 0 1px 0 rgba(255, 255, 255, 1)`
          };
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .card:hover::before {
          opacity: 1;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: ${isDark
            ? `0 25px 70px rgba(0, 0, 0, 0.5),
               0 0 0 2px rgba(199, 255, 0, 0.3),
               inset 0 1px 0 rgba(255, 255, 255, 0.3)`
            : `0 25px 70px rgba(0, 0, 0, 0.15),
               0 0 0 2px rgba(199, 255, 0, 0.4),
               inset 0 1px 0 rgba(255, 255, 255, 1)`
          };
        }

        .card-left {
          animation: slideInLeft 0.8s ease-out 0.4s backwards;
        }

        .card-right {
          animation: slideInRight 0.8s ease-out 0.5s backwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .online-badge {
          background: ${isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))'
          };
          border: 2px solid ${isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 30px;
          padding: 0.8rem 2.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${isDark
            ? `0 5px 15px rgba(0, 0, 0, 0.15),
               inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 5px 15px rgba(0, 0, 0, 0.08),
               inset 0 1px 0 rgba(255, 255, 255, 1)`
          };
          position: relative;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .online-badge::before {
          content: '';
          position: absolute;
          left: 1rem;
          width: 8px;
          height: 8px;
          background: var(--neon-green);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--neon-green);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .badge-text {
          font-family: var(--font-poppins), sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: ${isDark ? '#1a1a1a' : '#2d3748'};
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }

        .card-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          filter: blur(60px);
          opacity: ${isDark ? '0.15' : '0.1'};
          pointer-events: none;
          animation: float 6s ease-in-out infinite;
          transition: opacity 0.3s ease;
        }

        .glow-pink {
          background: var(--hot-pink);
          bottom: 10%;
          right: 10%;
        }

        .glow-blue {
          background: var(--electric-blue);
          top: 20%;
          left: 20%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -30px);
          }
          66% {
            transform: translate(-30px, 30px);
          }
        }

        @media (max-width: 1200px) {
          .container {
            max-width: 1100px;
          }

          .card {
            height: 55vh;
          }
        }

        @media (max-width: 1024px) {
          .content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .header {
            padding: 1.2rem 2rem;
          }

          .logo {
            font-size: 2rem;
          }

          .card {
            min-height: 350px;
            height: 45vh;
            max-height: 500px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 1.5rem;
          }

          .header {
            padding: 1rem 1.5rem;
            border-radius: 35px;
          }

          .friends-text {
            font-size: 1.1rem;
          }

          .logo {
            font-size: 1.8rem;
          }

          .auth-buttons {
            gap: 1rem;
          }

          .auth-btn {
            font-size: 0.9rem;
          }

          .nav-right {
            gap: 1rem;
          }

          .theme-toggle {
            width: 40px;
            height: 40px;
          }

          .content {
            gap: 1.5rem;
          }

          .card {
            min-height: 300px;
            height: 40vh;
            max-height: 450px;
            border-radius: 35px;
          }

          .online-badge {
            padding: 0.7rem 2rem;
          }

          .badge-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 640px) {
          .container {
            padding: 1rem;
            min-height: 100vh;
          }

          .header {
            padding: 1rem 1.25rem;
            border-radius: 30px;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .friends-section {
            order: 2;
            flex: 0 0 100%;
            text-align: center;
          }

          .logo {
            order: 1;
            font-size: 1.5rem;
          }

          .nav-right {
            order: 3;
            flex: 0 0 100%;
            justify-content: space-between;
          }

          .auth-buttons {
            gap: 0.75rem;
          }

          .auth-btn {
            font-size: 0.85rem;
          }

          .theme-toggle {
            width: 38px;
            height: 38px;
          }

          .theme-toggle svg {
            width: 20px;
            height: 20px;
          }

          .menu-icon span {
            width: 25px;
            height: 3px;
          }

          .content {
            gap: 1rem;
          }

          .card {
            min-height: 280px;
            height: 35vh;
            max-height: 400px;
            border-radius: 30px;
            padding: 1.5rem;
          }

          .online-badge {
            padding: 0.6rem 1.75rem;
          }

          .badge-text {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0.75rem;
          }

          .header {
            padding: 0.85rem 1rem;
            border-radius: 25px;
            margin-bottom: 1rem;
          }

          .friends-text {
            font-size: 1rem;
          }

          .logo {
            font-size: 1.3rem;
          }

          .auth-buttons {
            gap: 0.5rem;
          }

          .auth-btn {
            font-size: 0.8rem;
          }

          .theme-toggle {
            width: 36px;
            height: 36px;
          }

          .theme-toggle svg {
            width: 18px;
            height: 18px;
          }

          .menu-icon span {
            width: 22px;
            height: 2.5px;
          }

          .content {
            gap: 0.75rem;
          }

          .card {
            min-height: 250px;
            height: 32vh;
            max-height: 350px;
            border-radius: 25px;
            padding: 1.25rem;
          }

          .online-badge {
            padding: 0.5rem 1.5rem;
          }

          .badge-text {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 375px) {
          .logo {
            font-size: 1.2rem;
          }

          .friends-text {
            font-size: 0.95rem;
          }

          .auth-btn {
            font-size: 0.75rem;
          }

          .theme-toggle {
            width: 34px;
            height: 34px;
          }

          .menu-icon span {
            width: 20px;
            height: 2px;
          }

          .card {
            min-height: 220px;
            height: 30vh;
          }

          .online-badge {
            padding: 0.45rem 1.25rem;
          }

          .badge-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
