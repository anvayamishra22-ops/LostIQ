import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🔍 LOSTIQ
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/lost-items" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Lost Items
            </NavLink>
          </li>
          <li>
            <NavLink to="/found-items" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Found Items
            </NavLink>
          </li>
          
          {user ? (
            <>
              <li>
                <NavLink to="/report-lost" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Report Lost
                </NavLink>
              </li>
              <li>
                <NavLink to="/report-found" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Report Found
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  My Reports
                </NavLink>
              </li>
              <li>
                <NavLink to="/claims" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Claims
                </NavLink>
              </li>
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li className="nav-user">
                <span className="nav-username">Hi, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
