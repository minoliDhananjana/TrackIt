import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = {
  internId: "",
  date: "",
  completedWork: "",
  currentWork: "",
  challenges: "",
  hoursWorked: 0,
  nextDayPlan: "",
};

export default function WorkLogs() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["ADMIN", "SUPERVISOR"].includes(currentUser.role);
  const [logs, setLogs] = useState([]);
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [logsResponse, internsResponse] = await Promise.all([
        api.get("/worklogs"),
        isAdmin ? api.get("/users/interns") : Promise.resolve({ data: [currentUser] }),
      ]);

      setLogs(isAdmin ? logsResponse.data : logsResponse.data.filter((log) => log.internId === currentUser.userId));
      setInterns(internsResponse.data);
    } catch {
      setError("Unable to load work logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!isAdmin) setFormData((current) => ({ ...current, internId: currentUser.userId }));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: name === "hoursWorked" ? Number(value) : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/worklogs", formData);

      setMessage("Work log submitted successfully");
      setFormData(isAdmin ? emptyForm : { ...emptyForm, internId: currentUser.userId });
      loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit work log"
      );
    }
  };

  const submitFeedback = async (logId) => {
    try {
      await api.put(`/worklogs/${logId}/feedback`, {
        feedback: feedback[logId] || "",
      });

      setMessage("Feedback added successfully");
      setFeedback({
        ...feedback,
        [logId]: "",
      });

      loadData();
    } catch {
      setError("Unable to add feedback");
    }
  };

  const getInternName = (internId) =>
    interns.find((intern) => intern.id === internId)?.fullName ||
    "Unknown Intern";

  const totalHours = logs.reduce(
    (sum, log) => sum + (Number(log.hoursWorked) || 0),
    0
  );

  return (
    <Layout>
      <div className="worklogs-page">
        <div className="page-heading-row worklog-heading"><div>
        <span className="page-kicker">Daily journal</span>
        <h1 style={{ color: "#052345", marginTop: 0 }}>
          {isAdmin ? "Daily Work Logs" : "Your Work Journal"}
        </h1>

        <p style={{ color: "#64748B", marginBottom: "24px" }}>
          {isAdmin ? "Review daily progress and provide supervisor feedback." : "Capture your progress, reflect on challenges, and plan what comes next."}
        </p></div><div className="worklog-stats"><div><strong>{logs.length}</strong><span>Entries</span></div><div><strong>{totalHours}</strong><span>Total hours</span></div></div></div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {loading && <div className="panel loading-state">Loading work logs…</div>}

        {!isAdmin && <div style={styles.card} className="journal-form-card">
          <div className="worklog-section-heading">
            <div className="worklog-section-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
            </div>
            <div><span>New entry</span><h2>How did today go?</h2><p>Share a concise update with your supervisor.</p></div>
          </div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <div className="identity-field worklog-identity"><span>Submitting as</span><strong>{currentUser.fullName}</strong></div>

            <label className="form-field"><span>Date</span>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={styles.input}
            />
            </label>

            <label className="form-field"><span>Hours worked</span>
            <input
              name="hoursWorked"
              type="number"
              min="0"
              step="0.5"
              value={formData.hoursWorked}
              onChange={handleChange}
              placeholder="Hours worked"
              style={styles.input}
            />
            </label>

            <label className="form-field worklog-text-field"><span>Completed today</span>
            <textarea
              name="completedWork"
              value={formData.completedWork}
              onChange={handleChange}
              placeholder="What did you complete today?"
              required
              style={styles.textarea}
            />
            </label>

            <label className="form-field worklog-text-field"><span>Currently working on</span>
            <textarea
              name="currentWork"
              value={formData.currentWork}
              onChange={handleChange}
              placeholder="What are you working on now?"
              required
              style={styles.textarea}
            />
            </label>

            <label className="form-field worklog-text-field"><span>Challenges or blockers <small>Optional</small></span>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Anything slowing you down?"
              style={styles.textarea}
            />
            </label>

            <label className="form-field worklog-text-field"><span>Plan for next day</span>
            <textarea
              name="nextDayPlan"
              value={formData.nextDayPlan}
              onChange={handleChange}
              placeholder="What will you focus on next?"
              required
              style={styles.textarea}
            />
            </label>

            <button type="submit" style={styles.primaryButton} className="worklog-submit-button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Submit daily log
            </button>
          </form>
        </div>}

        <div style={styles.card} className="journal-list-card">
          <div className="worklog-list-heading"><div><span>{isAdmin ? "Team activity" : "Your history"}</span><h2>{isAdmin ? "Submitted Work Logs" : "Previous entries"}</h2></div><p>{logs.length} {logs.length === 1 ? "entry" : "entries"}</p></div>

          {logs.length === 0 ? (
            <div className="worklog-empty"><div aria-hidden="true">✦</div><strong>No work logs yet</strong><p>Your submitted daily updates will appear here.</p></div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {logs.map((log) => (
                <div key={log.id} style={styles.logCard} className="worklog-card">
                  <div style={styles.logHeader} className="worklog-card-header">
                    <div>
                      <span className="worklog-entry-label">Daily entry</span>
                      <strong style={{ color: "#052345" }}>
                        {getInternName(log.internId)}
                      </strong>

                      <p style={styles.mutedText}>📅 {log.date}</p>
                    </div>

                    <strong className="hours-badge">
                      {log.hoursWorked} hours
                    </strong>
                  </div>

                  <div className="worklog-detail-grid">
                    <div className="worklog-detail completed"><span>✓</span><div><strong>Completed</strong><p>{log.completedWork}</p></div></div>
                    <div className="worklog-detail current"><span>↗</span><div><strong>In progress</strong><p>{log.currentWork}</p></div></div>
                    <div className="worklog-detail challenge"><span>!</span><div><strong>Challenges</strong><p>{log.challenges || "No blockers reported"}</p></div></div>
                    <div className="worklog-detail next"><span>→</span><div><strong>Up next</strong><p>{log.nextDayPlan}</p></div></div>
                  </div>

                  {log.supervisorFeedback && (
                    <div style={styles.feedbackBox}>
                      <strong>Supervisor feedback:</strong>{" "}
                      {log.supervisorFeedback}
                    </div>
                  )}

                  {isAdmin && <div style={styles.feedbackRow}>
                    <input
                      value={feedback[log.id] || ""}
                      onChange={(event) =>
                        setFeedback({
                          ...feedback,
                          [log.id]: event.target.value,
                        })
                      }
                      placeholder="Write supervisor feedback"
                      style={styles.feedbackInput}
                    />

                    <button
                      onClick={() => submitFeedback(log.id)}
                      style={styles.primaryButton}
                    >
                      Add Feedback
                    </button>
                  </div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  card: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "24px",
  },

  formGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  input: {
    flex: "1 1 220px",
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
  },

  textarea: {
    flex: "1 1 320px",
    minHeight: "90px",
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
  },

  primaryButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#13A56D",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },

  logCard: {
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "18px",
  },

  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  mutedText: {
    color: "#64748B",
    margin: "5px 0 0",
  },

  feedbackBox: {
    background: "#DCFCE7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "12px",
  },

  feedbackRow: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
  },

  feedbackInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
  },

  success: {
    background: "#DCFCE7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
  },

  error: {
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
  },
};
