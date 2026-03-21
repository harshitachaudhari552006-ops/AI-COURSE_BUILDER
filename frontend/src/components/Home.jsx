import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSemesters, fetchLiveClasses } from '../api';
import { FiBook, FiLogOut, FiUser, FiBox, FiVideo } from 'react-icons/fi';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null); // New state for modal
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Poll for live classes every 30 seconds
  useEffect(() => {
    const checkLiveClasses = async () => {
      try {
        const live = await fetchLiveClasses();
        setLiveClasses(Array.isArray(live) ? live : []);
      } catch (err) {
        console.error('Failed to fetch live classes:', err);
      }
    };

    checkLiveClasses();
    const interval = setInterval(checkLiveClasses, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSemesters = async (syllabus) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSemesters(syllabus);
      setSemesters(Array.isArray(data) ? data : []);
      setSelectedSyllabus(syllabus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabusSelect = (syllabus) => {
    loadSemesters(syllabus);
  };

  const handleSemesterSelect = (semesterId) => {
    navigate(`/semester/${semesterId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSyllabusSelection = () => (
    <div className="syllabus-selection">
      <h2>Select Your Syllabus</h2>
      <div className="syllabus-grid">
        <div className="syllabus-card" onClick={() => handleSyllabusSelect('2019-C')}>
          <div className="syllabus-icon">🎓</div>
          <h3>2019-C Syllabus</h3>
          <p>Traditional choice-based credit system</p>
        </div>
        <div className="syllabus-card" onClick={() => handleSyllabusSelect('NEP 2020')}>
          <div className="syllabus-icon">✨</div>
          <h3>NEP 2020</h3>
          <p>New National Education Policy</p>
        </div>
      </div>
    </div>
  );

  const renderSemesterSelection = () => (
    <>
      <div className="welcome-section">
        <h2>{selectedSyllabus} - Semesters</h2>
        <p>Select your semester to view subjects and materials</p>
        <button onClick={() => setSelectedSyllabus(null)} className="btn btn-secondary">
          Change Syllabus
        </button>
      </div>

      {semesters.length === 0 && !error && (
        <div className="empty-state">
          <p>No semesters found for {selectedSyllabus} syllabus.</p>
          <p style={{ marginTop: 8 }}>
            Run database scripts to add data for this syllabus.
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
    </>
  );

  return (
    <div className="home-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🎓 AI Course Builder</h1>
          <div className="user-info">
            {liveClasses.length > 0 && (
              <button 
                onClick={() => setActiveMeeting(liveClasses[0])}
                className="live-pulse-btn"
              >
                <FiVideo /> Join Live: {liveClasses[0].name}
              </button>
            )}
            <button 
              onClick={() => navigate('/s3-notes')} 
              className="btn btn-primary btn-sm"
              style={{ marginRight: '10px' }}
            >
              <FiBox /> AWS Notes
            </button>
            <FiUser /> {user?.name || user?.studentId}
            <button onClick={handleLogout} className="btn-icon">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : !selectedSyllabus ? (
          renderSyllabusSelection()
        ) : (
          renderSemesterSelection()
        )}
      </main>

      {/* Embedded Live Class Modal */}
      {activeMeeting && (
        <div className="modal-overlay" onClick={() => setActiveMeeting(null)}>
          <div className="modal-content live-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
              <h3>🔴 Live: {activeMeeting.name}</h3>
              <button onClick={() => setActiveMeeting(null)} className="btn btn-secondary btn-sm">Close Class</button>
            </div>
            <div className="live-iframe-wrapper">
              <iframe
                src={`https://meet.jit.si/${activeMeeting.name.replace(/\s+/g, '-')}-${activeMeeting._id.substring(0,6)}#userInfo.displayName="${user?.name || 'Student'}"`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                style={{ width: '100%', height: '550px', border: 'none', borderRadius: '8px' }}
                title="Live Lecture"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

