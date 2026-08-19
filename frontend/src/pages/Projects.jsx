import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = {
  name: "",
  description: "",
  technology: "",
  deadline: "",
  status: "PLANNED",
  assignedInternIds: [],
};

export default function Projects() {
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );
  const isAdmin = ["ADMIN", "SUPERVISOR"].includes(currentUser.role);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectsResponse, internsResponse] = await Promise.all([
        api.get("/projects"),
        isAdmin ? api.get("/users/interns") : Promise.resolve({ data: [currentUser] }),
      ]);

      setProjects(isAdmin ? projectsResponse.data : projectsResponse.data.filter((project) => project.assignedInternIds?.includes(currentUser.userId)));
      setInterns(internsResponse.data);
    } catch {
      setError("Unable to load projects");
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const toggleIntern = (internId) => setFormData((current) => ({
    ...current,
    assignedInternIds: current.assignedInternIds.includes(internId)
      ? current.assignedInternIds.filter((id) => id !== internId)
      : [...current.assignedInternIds, internId],
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
        setMessage("Project updated successfully");
      } else {
        await api.post("/projects", formData);
        setMessage("Project created successfully");
      }

      setFormData(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save project"
      );
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);

    setFormData({
      name: project.name,
      description: project.description,
      technology: project.technology,
      deadline: project.deadline,
      status: project.status,
      assignedInternIds: project.assignedInternIds || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getInternNames = (ids = []) =>
    ids
      .map((id) => interns.find((intern) => intern.id === id)?.fullName)
      .filter(Boolean)
      .join(", ");

  return (
    <Layout>
      <div className="projects-page">
        <div className="page-heading-row">
          <div>
        <h1 style={{ color: "#052345", marginTop: 0 }}>
          {isAdmin ? "Project Management" : "My Projects"}
        </h1>

        <p style={{ color: "#64748B", marginBottom: "24px" }}>
          {isAdmin ? "Create projects, set deadlines and assign interns." : "View the projects assigned to your internship."}
        </p>
          </div>
          <div className="page-count"><strong>{projects.length}</strong><span>{projects.length === 1 ? "Project" : "Projects"}</span></div>
        </div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {loading && <div className="panel loading-state">Loading projects…</div>}

        {isAdmin && <div style={styles.card} className="project-form-card">
          <div className="section-heading"><div className="section-icon">{editingId ? "✎" : "+"}</div><div><span>Project details</span><h2>{editingId ? "Edit Project" : "Create a new project"}</h2></div></div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <label className="form-field"><span>Project name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Project name"
              required
              style={styles.input}
            />
            </label>

            <label className="form-field"><span>Technology stack</span>
            <input
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              placeholder="Technology"
              required
              style={styles.input}
            />
            </label>

            <label className="form-field"><span>Deadline</span>
            <input
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
              style={styles.input}
            />
            </label>

            <label className="form-field"><span>Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            </label>

            <label className="form-field form-field-wide"><span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description"
              required
              style={{ ...styles.input, minHeight: "90px" }}
            />
            </label>

            <fieldset className="intern-picker"><legend>Assign interns <small>{formData.assignedInternIds.length} selected</small></legend>
              {interns.length === 0 ? <p>No active interns available.</p> : interns.map((intern) => <label key={intern.id} className="intern-option"><input type="checkbox" checked={formData.assignedInternIds.includes(intern.id)} onChange={() => toggleIntern(intern.id)} /><span className="intern-option-avatar">{intern.fullName?.split(" ").map((part) => part[0]).slice(0,2).join("")}</span><span><strong>{intern.fullName}</strong><small>{intern.email}</small></span></label>)}
            </fieldset>

            <div className="form-actions">
            <button type="submit" style={styles.primaryButton}>
              {editingId ? "Update Project" : "Create Project"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
            )}
            </div>
          </form>
        </div>}

        <div style={styles.card} className="projects-list-card">
          <div className="section-heading list-heading"><div><span>{isAdmin ? "Portfolio" : "Assigned work"}</span><h2>{isAdmin ? "All projects" : "Your projects"}</h2></div></div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Technology</th>
                  <th style={styles.th}>Deadline</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>{isAdmin ? "Assigned Interns" : "Assigned To"}</th>
                  {isAdmin && <th style={styles.th}>Action</th>}
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td style={styles.td}><strong className="project-name">{project.name}</strong></td>
                    <td style={styles.td}><span className="tech-pill">{project.technology}</span></td>
                    <td style={styles.td}>{project.deadline}</td>
                    <td style={styles.td}><span className={`project-status status-${project.status?.toLowerCase()}`}>{project.status?.replace("_", " ")}</span></td>
                    <td style={styles.td}>{isAdmin ? (getInternNames(project.assignedInternIds) || <span className="muted-value">Unassigned</span>) : "You"}</td>
                    {isAdmin && <td style={styles.td}>
                      <button
                        onClick={() => startEdit(project)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                    </td>}
                  </tr>
                ))}

                {projects.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#64748B",
                      }}
                    >
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
    flex: "1 1 240px",
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
  secondaryButton: {
    padding: "12px 20px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    color: "#475569",
    borderBottom: "1px solid #E2E8F0",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #E2E8F0",
  },
  editButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#052345",
    color: "white",
    cursor: "pointer",
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
