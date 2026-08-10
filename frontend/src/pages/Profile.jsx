import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/me")
      .then(({ data }) => setProfile(data))
      .catch(() => setError("Unable to load your profile."));
  }, []);

  return <Layout>
    <div className="dashboard-head"><div><span className="page-kicker">Account</span><h1>My Profile</h1><p>Your TrackIt account and access details.</p></div></div>
    {error && <div className="login-error" role="alert">{error}</div>}
    {!profile && !error ? <div className="panel loading-state">Loading profile…</div> : profile && <section className="profile-card panel">
      <div className="profile-avatar">{profile.fullName.split(" ").map((part) => part[0]).slice(0,2).join("")}</div>
      <div className="profile-intro"><span>Signed in as</span><h2>{profile.fullName}</h2><p>Your account is secured with role-based access.</p></div>
      <div><span>Full name</span><strong>{profile.fullName}</strong></div>
      <div><span>Email address</span><strong>{profile.email}</strong></div>
      <div><span>Account role</span><strong>{profile.role}</strong></div>
      <div><span>Status</span><strong className={profile.active ? "active-text" : "inactive-text"}>{profile.active ? "Active" : "Inactive"}</strong></div>
    </section>}
  </Layout>;
}
