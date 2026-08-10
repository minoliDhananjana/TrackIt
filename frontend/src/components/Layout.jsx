import Sidebar from './Sidebar';
import logo from '../assets/logo.png';

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isIntern = user.role === 'INTERN';
  const initials = (user.fullName || 'TrackIt User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-shell" data-role={isIntern ? 'intern' : 'admin'}>
      <Sidebar />
      <main className="main-content">
        <div className="page-wrap">
          <header className="topbar">
            <div className="topbar-mobile-logo"><img src={logo} alt="TrackIt" /></div>
            <div className="workspace-label">
              <span className="workspace-dot" />
              <div><strong>{isIntern ? 'Intern workspace' : 'Administration workspace'}</strong><small>{isIntern ? 'Focus, submit and grow' : 'Manage, review and guide'}</small></div>
            </div>
            <div className="user-chip" aria-label="Signed-in user">
              <div className="avatar">{initials}</div>
              <div><strong>{user.fullName || 'TrackIt User'}</strong><span>{(user.role || 'member').toLowerCase()}</span></div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
