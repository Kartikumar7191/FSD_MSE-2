import React from 'react';

export default function Navbar({ student, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">📋</div>
        <span>Grievance Portal</span>
      </div>

      <div className="navbar-user">
        <span>Hello, <strong>{student?.name}</strong></span>
        <button className="btn btn-sm btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
