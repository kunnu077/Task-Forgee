import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-ink-950 flex items-center justify-center"><span className="text-ink-400 animate-pulse">Loading…</span></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={<PublicRoute><AuthPage mode="login" /></PublicRoute>}
      />
      <Route
        path="/signup"
        element={<PublicRoute><AuthPage mode="signup" /></PublicRoute>}
      />
      <Route
        path="/dashboard"
        element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>}
      />
      <Route
        path="/projects"
        element={<PrivateRoute><Layout><ProjectsPage /></Layout></PrivateRoute>}
      />
      <Route
        path="/projects/:id"
        element={<PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
