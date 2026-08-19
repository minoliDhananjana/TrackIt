import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = {
  taskId: "",
  internId: "",
  repositoryLink: "",
  documentLink: "",
  completionNote: "",
};

export default function Submissions() {
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );
  const isAdmin = ["ADMIN", "SUPERVISOR"].includes(currentUser.role);
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [reviews, setReviews] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        submissionsResponse,
        tasksResponse,
        internsResponse,
      ] = await Promise.all([
        api.get("/submissions"),
        api.get("/tasks"),
        isAdmin ? api.get("/users/interns") : Promise.resolve({ data: [currentUser] }),
      ]);

      setSubmissions(isAdmin ? submissionsResponse.data : submissionsResponse.data.filter((submission) => submission.internId === currentUser.userId));
      setTasks(isAdmin ? tasksResponse.data : tasksResponse.data.filter((task) => task.assignedInternId === currentUser.userId));
      setInterns(internsResponse.data);
    } catch {
      setError("Unable to load submissions");
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    void loadData();
    if (!isAdmin) setFormData((current) => ({ ...current, internId: currentUser.userId }));
  }, [currentUser.userId, isAdmin, loadData]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/submissions", formData);

      setMessage("Work submitted successfully");
      setFormData(isAdmin ? emptyForm : { ...emptyForm, internId: currentUser.userId });
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit work"
      );
    }
  };

  const updateReview = (submissionId, field, value) => {
    setReviews({
      ...reviews,
      [submissionId]: {
        comment: reviews[submissionId]?.comment || "",
        approved: reviews[submissionId]?.approved || false,
        [field]: value,
      },
    });
  };

  const reviewSubmission = async (submissionId) => {
    const review = reviews[submissionId] || {
      comment: "",
      approved: false,
    };

    try {
      await api.put(`/submissions/${submissionId}/review`, {
        comment: review.comment,
        approved: review.approved,
      });

      setMessage(
        review.approved
          ? "Submission approved successfully"
          : "Revision requested successfully"
      );

      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to review submission");
    }
  };

  const getTaskName = (taskId) =>
    tasks.find((task) => task.id === taskId)?.title ||
    "Unknown Task";

  const getInternName = (internId) =>
    interns.find((intern) => intern.id === internId)?.fullName ||
    "Unknown Intern";

  const getReviewStatus = (submission) =>
    submission.reviewStatus || (submission.approved ? "APPROVED" : "PENDING");

  return (
    <Layout>
      <div className="submissions-page">
        <div className="page-heading-row submission-page-heading"><div>
        <span className="page-kicker">Review workflow</span>
        <h1 style={{ color: "#052345", marginTop: 0 }}>
          {isAdmin ? "Submissions and Feedback" : "Submit Your Work"}
        </h1>

        <p style={{ color: "#64748B", marginBottom: "24px" }}>
          {isAdmin ? "Review completed work, approve results, or request revisions." : "Share your completed work and track supervisor feedback in one place."}
        </p></div><div className="page-count"><strong>{submissions.length}</strong><span>Submissions</span></div></div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {loading && <div className="panel loading-state">Loading submissions…</div>}

        {!isAdmin && <div style={styles.card} className="submission-form-card">
          <div className="submission-section-heading">
            <div className="submission-section-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/></svg></div>
            <div><span>New submission</span><h2>Send work for review</h2><p>Select a task and include links or a clear completion note.</p></div>
          </div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <label className="form-field submission-task-field"><span>Task</span><select
              name="taskId"
              value={formData.taskId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select task</option>

              {tasks
                .filter((task) => !["COMPLETED", "SUBMITTED"].includes(task.status))
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select></label>

            <div className="identity-field submission-identity"><span>Submitting as</span><strong>{currentUser.fullName}</strong></div>

            <label className="form-field"><span>Repository link <small>Optional</small></span><input
              name="repositoryLink"
              type="url"
              value={formData.repositoryLink}
              onChange={handleChange}
              placeholder="https://github.com/..."
              style={styles.input}
            /></label>

            <label className="form-field"><span>Document link <small>Optional</small></span><input
              name="documentLink"
              type="url"
              value={formData.documentLink}
              onChange={handleChange}
              placeholder="https://docs.google.com/..."
              style={styles.input}
            /></label>

            <label className="form-field submission-note-field"><span>Completion note</span><textarea
              name="completionNote"
              value={formData.completionNote}
              onChange={handleChange}
              placeholder="Summarize what you completed and anything your supervisor should know."
              required
              style={styles.textarea}
            /></label>

            <button type="submit" style={styles.primaryButton} className="submission-submit-button">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/></svg>
              Send for review
            </button>
          </form>
        </div>}

        <div style={styles.card} className="submission-list-card">
          <div className="submission-list-heading"><div><span>{isAdmin ? "Review queue" : "Submission history"}</span><h2>Submitted Work</h2></div><span>{submissions.length} {submissions.length === 1 ? "item" : "items"}</span></div>

          {submissions.length === 0 ? (
            <div className="submission-empty"><div aria-hidden="true">+</div><strong>No submissions yet</strong><p>Work you send for review will appear here.</p></div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {submissions.map((submission) => (
                <div key={submission.id} style={styles.submissionCard} className="submission-card">
                  <div style={styles.submissionHeader} className="submission-card-header">
                    <div>
                      <span className="submission-card-label">Task submission</span>
                      <h3
                        style={{
                          color: "#052345",
                          margin: "0 0 5px",
                        }}
                      >
                        {getTaskName(submission.taskId)}
                      </h3>

                      <p style={styles.mutedText}>
                        Submitted by{" "}
                        {getInternName(submission.internId)}
                      </p>
                    </div>

                    <span
                      className={`submission-status submission-status-${getReviewStatus(submission).toLowerCase()}`}
                      style={{
                        ...styles.status,
                        background: getReviewStatus(submission) === "APPROVED"
                          ? "#DCFCE7"
                          : getReviewStatus(submission) === "REVISION_REQUIRED" ? "#FEE2E2" : "#FEF3C7",
                        color: getReviewStatus(submission) === "APPROVED"
                          ? "#166534"
                          : getReviewStatus(submission) === "REVISION_REQUIRED" ? "#991B1B" : "#92400E",
                      }}
                    >
                      {getReviewStatus(submission) === "APPROVED"
                        ? "Approved"
                        : getReviewStatus(submission) === "REVISION_REQUIRED" ? "Revision Required" : "Pending Review"}
                    </span>
                  </div>

                  <div className="submission-note"><span>Completion note</span><p>{submission.completionNote}</p></div>

                  <div className="submission-links">
                  {submission.repositoryLink && (
                    <p>
                      <a
                        href={submission.repositoryLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>Repository</span> Open link ↗
                      </a>
                    </p>
                  )}

                  {submission.documentLink && (
                    <p>
                      <a
                        href={submission.documentLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>Document</span> Open link ↗
                      </a>
                    </p>
                  )}
                  </div>

                  {submission.supervisorComment && (
                    <div style={styles.feedbackBox}>
                      <strong>Supervisor comment:</strong>{" "}
                      {submission.supervisorComment}
                    </div>
                  )}

                  {isAdmin && getReviewStatus(submission) === "PENDING" && <div style={styles.reviewArea}>
                    <input
                      value={reviews[submission.id]?.comment || ""}
                      onChange={(event) =>
                        updateReview(
                          submission.id,
                          "comment",
                          event.target.value
                        )
                      }
                      placeholder="Supervisor comment"
                      style={styles.reviewInput}
                    />

                    <select
                      value={
                        reviews[submission.id]?.approved
                          ? "approved"
                          : "revision"
                      }
                      onChange={(event) =>
                        updateReview(
                          submission.id,
                          "approved",
                          event.target.value === "approved"
                        )
                      }
                      style={styles.reviewSelect}
                    >
                      <option value="revision">
                        Request Revision
                      </option>
                      <option value="approved">
                        Approve
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        reviewSubmission(submission.id)
                      }
                      style={styles.primaryButton}
                    >
                      Submit Review
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
    flex: "1 1 230px",
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
  },

  textarea: {
    flex: "1 1 100%",
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

  submissionCard: {
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "18px",
  },

  submissionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },

  mutedText: {
    color: "#64748B",
    margin: 0,
  },

  status: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
  },

  feedbackBox: {
    background: "#E0F2FE",
    color: "#075985",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "12px",
  },

  reviewArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "16px",
  },

  reviewInput: {
    flex: "1 1 260px",
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
  },

  reviewSelect: {
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
