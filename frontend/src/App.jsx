import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interns from "./pages/Interns";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import WorkLogs from "./pages/WorkLogs";
import Submissions from "./pages/Submissions";
import Profile from "./pages/Profile";

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return ["ADMIN", "SUPERVISOR"].includes(user.role)
    ? children
    : <Navigate to="/dashboard" replace />;
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/interns"
          element={token ? <AdminRoute><Interns /></AdminRoute> : <Navigate to="/login" replace />}
        />

        <Route
          path="/projects"
          element={token ? <Projects /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/tasks"
          element={token ? <Tasks /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/worklogs"
          element={token ? <WorkLogs /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/submissions"
          element={token ? <Submissions /> : <Navigate to="/login" replace />}
        />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" replace />} />
        <Route
          path="/"
          element={
            <Navigate
              to={token ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
