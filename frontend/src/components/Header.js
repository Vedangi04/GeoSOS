import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <h1 className="logo">🧭 GeoSOS</h1>
      <nav className="nav-buttons">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>SOS</Link>
        <Link to="/map" className={location.pathname === '/map' ? 'active' : ''}>Map</Link>
        <Link to="/hospitals" className={location.pathname === '/hospitals' ? 'active' : ''}>Hospitals</Link>
      </nav>
    </header>
  );
};

export default Header;
