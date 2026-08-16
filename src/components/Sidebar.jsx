import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ open, onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <aside id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
          Fesa
        </NavLink>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
          Dashboard
        </NavLink>
        <NavLink to="/career-profile" className={linkClass} onClick={onClose}>
          Career Profile
        </NavLink>
        <NavLink to="/new-application" className={linkClass} onClick={onClose}>
          New Application
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>Job search, simplified.</span>
      </div>
    </aside>
  );
}