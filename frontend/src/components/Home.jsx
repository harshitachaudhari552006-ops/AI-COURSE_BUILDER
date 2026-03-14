import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSemesters } from '../api';
import { FiBook, FiLogOut, FiUser } from 'react-icons/fi';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      const data = await fetchSemesters();
      setSemesters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterSelect = (semesterId) => {
    navigate(`/semester/${semesterId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading semesters...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🎓 AI Course Builder</h1>
          <div className="user-info">
            <FiUser /> {user?.name || user?.studentId}
            <button onClick={handleLogout} className="btn-icon">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          <h2>Welcome, {user?.name || user?.studentId}!</h2>
          <p>Select your semester to view subjects and learning materials</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {semesters.length === 0 && !error && (
          <div className="empty-state">
            <p>No semesters found yet.</p>
            <p style={{ marginTop: 8 }}>
              Run <code>cd backend && npm run seed</code> to create sample semesters, subjects, and modules.
            </p>
          </div>
        )}

        <div className="semesters-grid">
          {semesters.map((semester) => (
            <div
              key={semester._id}
              className="semester-card"
              onClick={() => handleSemesterSelect(semester._id)}
            >
              <div className="semester-icon">
                <FiBook />
              </div>
              <h3>Semester {semester.number}</h3>
              <p>{semester.name}</p>
              {semester.subjects && (
                <span className="subject-count">
                  {semester.subjects.length} Subject{semester.subjects.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

