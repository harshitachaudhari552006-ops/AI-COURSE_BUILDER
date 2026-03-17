import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import SemesterView from './components/SemesterView';
import SubjectView from './components/SubjectView';
import ModuleView from './components/ModuleView';
import S3Explorer from './components/S3Explorer';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/semester/:id"
        element={
          <PrivateRoute>
            <SemesterView />
          </PrivateRoute>
        }
      />
      <Route
        path="/subject/:id"
        element={
          <PrivateRoute>
            <SubjectView />
          </PrivateRoute>
        }
      />
      <Route
        path="/module/:id"
        element={
          <PrivateRoute>
            <ModuleView />
          </PrivateRoute>
        }
      />
      <Route
        path="/s3-notes"
        element={
          <PrivateRoute>
            <S3Explorer />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
