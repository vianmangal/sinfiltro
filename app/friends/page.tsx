'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FriendsPage() {
  const [search, setSearch] = useState('');

  const friendsList = [
    { id: 1, name: 'Name1', online: true },
    { id: 2, name: 'Name2', online: false },
    { id: 3, name: 'Name3', online: true },
  ];

  return (
    <div className="main-layout">
      <header className="navbar">
        <Link href="/" className="back-btn">← Friends</Link>
        <div className="navbar-logo">Sin<span>Filtro</span></div>
        <div className="navbar-right">
          <Link href="/friends/add" className="add-friend" aria-label="Add friend">Add Friend</Link>
        </div>
      </header>

      <div className="content-container">
        <div className="friends-box">
          <input 
            type="text" 
            placeholder="Search your circle..." 
            className="search-bar"
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <div className="list">
            {friendsList
              .filter((friend) => friend.name.toLowerCase().includes(search.toLowerCase()))
              .map((friend) => (
              <div key={friend.id} className="friend-card">
                <div className="user-info">
                  <div className="pfp-placeholder"></div>
                  <span className="user-name">{friend.name}</span>
                </div>
                <div className="status-container">
                  <div className={`status-dot ${friend.online ? 'online' : 'offline'}`}></div>
                  <span className="status-text">{friend.online ? 'Online' : 'Away'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-layout {
          min-height: 100vh;
          background: #1a1a1a;
          padding: 2rem;
          color: white;
          font-family: var(--font-poppins), sans-serif;
        }

        .navbar {
          background: #f5f5f5;
          padding: 1rem 3rem;
          border-radius: 50px;
          display: flex;
        
          justify-content: space-between;
          align-items: center;
          color: #1a1a1a;
          margin-bottom: 2rem;
        }

        .navbar-logo {
          font-family: var(--font-archivo), sans-serif;
          font-size: 1.8rem;
        }

        .navbar-logo span {
          border-bottom: 3px solid #FF007A;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .add-friend {
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #1f1f1f;
          color: #f5f5f5;
          text-decoration: none;
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1;
          border: 1px solid #3a3a3a;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .add-friend:hover {
          transform: translateY(-1px);
          border-color: #C7FF00;
        }

        .back-btn {
          font-weight: 600;
          opacity: 0.86;
          transition: opacity 0.2s ease;
        }

        .back-btn:hover {
          opacity: 1;
        }

        .friends-box {
          background: #252525;
          border-radius: 40px;
          padding: 2rem;
          border: 1px solid #333;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-bar {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #444;
          padding: 1rem;
          border-radius: 15px;
          color: white;
          margin-bottom: 2rem;
        }

        .friend-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #1e1e1e;
          border-radius: 20px;
          margin-bottom: 1rem;
          border: 1px solid #2a2a2a;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pfp-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #333;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .online {
          background: #C7FF00;
          box-shadow: 0 0 10px #C7FF00;
        }

        .offline {
          background: #555;
        }

        .status-container {
          display: flex;
          align-items: center;
        }

        .status-text {
          font-size: 0.8rem;
          color: #888;
        }
      `}</style>
    </div>
  );
}
