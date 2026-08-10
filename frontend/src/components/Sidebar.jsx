import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Icon = ({ name }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    interns: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    projects: <><path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3M3 12h18"/></>,
    tasks: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    logs: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    submissions: <><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const allLinks = [
  { label:'Dashboard', path:'/dashboard', icon:'dashboard' },
  { label:'Interns', path:'/interns', icon:'interns', admin:true },
  { label:'Projects', path:'/projects', icon:'projects' },
  { label:'Tasks', path:'/tasks', icon:'tasks' },
  { label:'Work Logs', path:'/worklogs', icon:'logs' },
  { label:'Submissions', path:'/submissions', icon:'submissions' },
  { label:'My Profile', path:'/profile', icon:'profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['ADMIN','SUPERVISOR'].includes(user.role);
  const links = allLinks.filter((link) => !link.admin || isAdmin).map((link) => ({
    ...link,
    label: !isAdmin && link.path === '/projects' ? 'My Projects' : !isAdmin && link.path === '/tasks' ? 'My Tasks' : link.label,
  }));
  const initials = (user.fullName || 'User').split(' ').map((part) => part[0]).slice(0,2).join('').toUpperCase();
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  return (
    <aside className={`sidebar ${isAdmin ? 'admin-sidebar' : 'intern-sidebar'}`}>
      <NavLink to="/dashboard" className="brand" aria-label="TrackIt dashboard"><img className="brand-logo" src={logo} alt="TrackIt" /></NavLink>
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map((link) => <NavLink key={link.path} to={link.path} className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}><Icon name={link.icon}/><span>{link.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-footer">
        <div className="role-card"><div className="role-avatar">{initials}</div><div><strong>{user.fullName || 'TrackIt User'}</strong><small>{(user.role || 'Member').toLowerCase()}</small></div></div>
        <button className="logout-btn" onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
}
