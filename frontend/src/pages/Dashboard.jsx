import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const StatIcon = ({ type }) => {
  const path = type === 'people' ? <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M16 5a3 3 0 0 1 0 6M18 13a4 4 0 0 1 3 4v3"/></> : type === 'project' ? <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 5V3h8v2M3 11h18"/></> : type === 'done' ? <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></> : type === 'late' ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></> : <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isIntern = user.role === 'INTERN';
  const [dashboard, setDashboard] = useState({ activeInterns:0, activeProjects:0, pendingTasks:0, completedTasks:0, overdueTasks:0, recentActivity:[] });
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard').then(({data}) => setDashboard(data)).catch(() => setError('Dashboard data is temporarily unavailable. Please try again.')); }, []);
  const total = dashboard.pendingTasks + dashboard.completedTasks + dashboard.overdueTasks;
  const completion = total ? Math.round((dashboard.completedTasks / total) * 100) : 0;
  const allStats = [
    ['Active interns',dashboard.activeInterns,'people',''], ['Active projects',dashboard.activeProjects,'project',''], ['Pending tasks',dashboard.pendingTasks,'task','warning'], ['Completed tasks',dashboard.completedTasks,'done',''], ['Overdue tasks',dashboard.overdueTasks,'late','danger']
  ];
  const stats = isIntern ? allStats.slice(1) : allStats;
  const today = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(new Date());

  return <Layout>
    <div className="dashboard-head"><div><span className="page-kicker">{isIntern ? 'My progress' : 'Overview'}</span><h1>Good to see you, {user.fullName?.split(' ')[0] || 'there'}.</h1><p>{isIntern ? 'Stay on top of your assignments, deadlines and supervisor feedback.' : 'Here is what is happening across your internship workspace.'}</p></div><div className="date-pill">{today}</div></div>
    {error && <div className="login-error" role="alert">{error}</div>}
    <section className="stats-grid" aria-label="Workspace statistics">
      {stats.map(([label,value,icon,tone]) => <article className={`stat-card ${tone}`} key={label}><div className="stat-icon"><StatIcon type={icon}/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></article>)}
    </section>
    <section className="dashboard-grid">
      <article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Live feed</span><h2>Recent activity</h2></div><span>Latest submissions</span></div>
        {!dashboard.recentActivity?.length ? <div className="empty-state">No recent activity yet. New submissions will appear here.</div> : dashboard.recentActivity.map((activity) => <div className="activity-item" key={activity.id}><div className="activity-dot"/><div><strong>Task submission received</strong><p>{activity.completionNote || 'A new task was submitted for review.'}</p></div></div>)}
      </article>
      <article className="panel completion-panel"><div className="panel-head"><div><span className="panel-kicker">Performance</span><h2>Task completion</h2></div><span>Overall</span></div><div className="progress-ring" style={{'--progress':`${completion}%`}}><span className="progress-value">{completion}%</span></div><div className="progress-legend"><div className="legend-item"><strong>{dashboard.completedTasks}</strong><span>Completed</span></div><div className="legend-item"><strong>{dashboard.pendingTasks}</strong><span>In progress</span></div></div></article>
    </section>
  </Layout>;
}
