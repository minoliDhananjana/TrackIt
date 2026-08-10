import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  projectId: "",
  assignedInternId: "",
  deadline: "",
  progress: 0,
};

export default function Tasks() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["ADMIN", "SUPERVISOR"].includes(currentUser.role);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tasksResponse, projectsResponse, internsResponse] =
        await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
          isAdmin ? api.get("/users/interns") : Promise.resolve({ data: [currentUser] }),
        ]);

      setTasks(isAdmin ? tasksResponse.data : tasksResponse.data.filter((task) => task.assignedInternId === currentUser.userId));
      setProjects(projectsResponse.data);
      setInterns(internsResponse.data);
    } catch {
      setError("Unable to load task information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: name === "progress" ? Number(value) : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId && !isAdmin) {
        await api.put(`/tasks/${editingId}/progress`, {
          status: formData.status,
          progress: formData.progress,
        });
        setMessage("Task progress updated successfully");
      } else if (editingId) {
        await api.put(`/tasks/${editingId}`, formData);
        setMessage("Task updated successfully");
      } else {
        await api.post("/tasks", formData);
        setMessage("Task created successfully");
      }

      setFormData(emptyForm);
      setEditingId(null);
      loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save task"
      );
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);

    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assignedInternId: task.assignedInternId,
      deadline: task.deadline,
      progress: task.progress,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);
      setMessage("Task deleted successfully");
      loadData();
    } catch {
      setError("Unable to delete task");
    }
  };

  const getProjectName = (projectId) =>
    projects.find((project) => project.id === projectId)?.name ||
    "Unknown project";

  const getInternName = (internId) =>
    interns.find((intern) => intern.id === internId)?.fullName ||
    "Unassigned";

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      !statusFilter || task.status === statusFilter;

    const matchesPriority =
      !priorityFilter || task.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const urgentCount = tasks.filter((task) => task.priority === "HIGH" && task.status !== "COMPLETED").length;

  return (
    <Layout>
      <div className="tasks-page">
        <div className="page-heading-row task-heading-row">
          <div>
        <h1 style={{ color: "#052345", marginTop: 0 }}>
          {isAdmin ? "Task Management" : "My Tasks"}
        </h1>

        <p style={{ color: "#64748B", marginBottom: "24px" }}>
          {isAdmin ? "Assign tasks, update progress and manage task status." : "Review assigned work and update your status and progress."}
        </p>
          </div>
          <div className="task-summary" aria-label="Task summary"><div><strong>{tasks.length}</strong><span>Total</span></div><div><strong>{completedCount}</strong><span>Completed</span></div><div className="urgent-summary"><strong>{urgentCount}</strong><span>High priority</span></div></div>
        </div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {loading && <div className="panel loading-state">Loading tasks…</div>}

        {(isAdmin || editingId) && <div style={styles.card} className="task-form-card">
          <div className="section-heading"><div className="section-icon">{editingId ? "✎" : "+"}</div><div><span>{isAdmin ? "Task details" : "Progress update"}</span><h2>{isAdmin ? (editingId ? "Edit task" : "Create a new task") : "Update task progress"}</h2></div></div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <label className="form-field"><span>Task title</span>
            <input
              name="title"
              disabled={!isAdmin}
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              required
              style={styles.input}
            />
            </label>

            <label className="form-field"><span>Project</span>
            <select
              name="projectId"
              disabled={!isAdmin}
              value={formData.projectId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            </label>

            <label className="form-field"><span>Assigned intern</span>
            <select
              name="assignedInternId"
              disabled={!isAdmin}
              value={formData.assignedInternId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Assign intern</option>

              {interns
                .filter((intern) => intern.active)
                .map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.fullName}
                  </option>
                ))}
            </select>
            </label>

            <label className="form-field"><span>Priority</span>
            <select
              name="priority"
              disabled={!isAdmin}
              value={formData.priority}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            </label>

            <label className="form-field"><span>Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              {isAdmin && <option value="SUBMITTED">Submitted</option>}
              {isAdmin && <option value="REVISION_REQUIRED">
                Revision Required
              </option>}
              {isAdmin && <option value="COMPLETED">Completed</option>}
            </select>
            </label>

            <label className="form-field"><span>Deadline</span>
            <input
              name="deadline"
              disabled={!isAdmin}
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
              style={styles.input}
            />
            </label>

            <label className="form-field progress-field"><span>Progress <strong>{formData.progress}%</strong></span><input name="progress" type="range" min="0" max="100" step="5" value={formData.progress} onChange={handleChange} /></label>

            <label className="form-field form-field-wide"><span>Description</span>
            <textarea
              name="description"
              disabled={!isAdmin}
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
              required
              style={{ ...styles.input, minHeight: "90px" }}
            />
            </label>

            <div className="form-actions">
            <button type="submit" style={styles.primaryButton}>
              {editingId ? "Update Task" : "Create Task"}
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

        <div style={styles.card} className="task-list-card">
          <div style={styles.tableHeader} className="task-list-heading">
            <div className="section-heading list-heading"><div><span>{isAdmin ? "Workflow" : "Assigned work"}</span><h2>{isAdmin ? "All tasks" : "My tasks"}</h2></div></div>

            <div className="task-filters">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                style={styles.filter}
              >
                <option value="">All statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="REVISION_REQUIRED">
                  Revision Required
                </option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                style={styles.filter}
              >
                <option value="">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Task</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Intern</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Progress</th>
                  <th style={styles.th}>Deadline</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={styles.td}><strong className="task-title">{task.title}</strong></td>
                    <td style={styles.td}>
                      {getProjectName(task.projectId)}
                    </td>
                    <td style={styles.td}>
                      {getInternName(task.assignedInternId)}
                    </td>
                    <td style={styles.td}><span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span></td>
                    <td style={styles.td}><span className={`task-status task-${task.status?.toLowerCase()}`}>{task.status?.replaceAll("_", " ")}</span></td>
                    <td style={styles.td}><div className="table-progress"><div><span style={{width:`${task.progress}%`}} /></div><strong>{task.progress}%</strong></div></td>
                    <td style={styles.td}>{task.deadline}</td>

                    <td style={styles.td}>
                      <div className="task-actions">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="task-action-button task-action-edit"
                        aria-label={`${isAdmin ? "Edit" : "Update"} ${task.title}`}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                        {isAdmin ? "Edit" : "Update"}
                      </button>

                      {isAdmin && <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="task-action-button task-action-delete"
                        aria-label={`Delete ${task.title}`}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5M14 11v5" />
                        </svg>
                        Delete
                      </button>}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#64748B",
                      }}
                    >
                      No tasks found.
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
    flex: "1 1 220px",
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

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  filter: {
    padding: "10px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
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
