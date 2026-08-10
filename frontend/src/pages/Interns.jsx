import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  role: "INTERN",
};

export default function Interns() {
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInterns = async () => {
    try {
      const response = await api.get("/users/interns");
      setInterns(response.data);
    } catch {
      setError("Unable to load interns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterns();
  }, []);

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
      if (editingId) {
        await api.put(`/users/interns/${editingId}`, {
          fullName: formData.fullName,
          email: formData.email,
        });

        setMessage("Intern updated successfully");
      } else {
        await api.post("/users/register", formData);
        setMessage("Intern created successfully");
      }

      setFormData(emptyForm);
      setEditingId(null);
      loadInterns();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data ||
          "Unable to save intern"
      );
    }
  };

  const startEdit = (intern) => {
    setEditingId(intern.id);
    setFormData({
      fullName: intern.fullName,
      email: intern.email,
      password: "",
      role: "INTERN",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const updateStatus = async (intern) => {
    try {
      await api.put(
        `/users/interns/${intern.id}/status?active=${!intern.active}`
      );

      loadInterns();
    } catch {
      setError("Unable to update intern status");
    }
  };

  const filteredInterns = interns.filter((intern) => {
    const keyword = search.toLowerCase();

    const matchesStatus = statusFilter === "" || (statusFilter === "active" ? intern.active : !intern.active);
    return matchesStatus && (
      intern.fullName.toLowerCase().includes(keyword) ||
      intern.email.toLowerCase().includes(keyword)
    );
  });

  return (
    <Layout>
      <div className="interns-page">
        <div className="page-heading-row"><div>
        <h1 style={{ color: "#052345", marginTop: 0 }}>
          Intern Management
        </h1>

        <p style={{ color: "#64748B", marginBottom: "24px" }}>
          Create, edit, search and activate or deactivate interns.
        </p></div><div className="page-count"><strong>{interns.length}</strong><span>Interns</span></div></div>

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        {loading && <div className="panel loading-state">Loading interns…</div>}

        <div style={styles.formCard} className="intern-form-card">
          <h2 style={{ color: "#052345", marginTop: 0 }}>
            {editingId ? "Edit Intern" : "Add Intern"}
          </h2>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              required
              style={styles.input}
            />

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              style={styles.input}
            />

            {!editingId && (
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                minLength="6"
                required
                style={styles.input}
              />
            )}

            <button type="submit" style={styles.primaryButton}>
              {editingId ? "Update Intern" : "Create Intern"}
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
          </form>
        </div>

        <div style={styles.tableCard} className="intern-list-card">
          <div style={styles.tableHeader}>
            <h2 style={{ color: "#052345", margin: 0 }}>
              Interns
            </h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.searchInput} aria-label="Filter interns by status">
                <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search interns..." style={styles.searchInput} />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterns.map((intern) => (
                  <tr key={intern.id}>
                    <td style={styles.td}>{intern.fullName}</td>
                    <td style={styles.td}>{intern.email}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          background: intern.active
                            ? "#DCFCE7"
                            : "#FEE2E2",
                          color: intern.active
                            ? "#166534"
                            : "#991B1B",
                        }}
                      >
                        {intern.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => startEdit(intern)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => updateStatus(intern)}
                        style={styles.statusButton}
                      >
                        {intern.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredInterns.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: "#64748B",
                      }}
                    >
                      No interns found.
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
  formCard: {
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

  tableCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "22px",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "18px",
  },

  searchInput: {
    padding: "10px 12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    width: "260px",
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

  status: {
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
  },

  editButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#052345",
    color: "white",
    cursor: "pointer",
    marginRight: "8px",
  },

  statusButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#13A56D",
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
