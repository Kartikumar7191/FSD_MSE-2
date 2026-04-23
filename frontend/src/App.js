import React, { useState } from 'react';
import './styles/App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  // Restore session from localStorage
  const [student, setStudent] = useState(() => {
    try {
      const s = localStorage.getItem('student');
      const t = localStorage.getItem('token');
      return s && t ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (studentData) => {
    setStudent(studentData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setStudent(null);
    setShowRegister(false);
  };

  // Protected route — show dashboard only if logged in
  if (student) {
    return <Dashboard student={student} onLogout={handleLogout} />;
  }

  if (showRegister) {
    return (
      <Register
        onSwitch={() => setShowRegister(false)}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <Login
      onSwitch={() => setShowRegister(true)}
      onLogin={handleLogin}
    />
  );
}
