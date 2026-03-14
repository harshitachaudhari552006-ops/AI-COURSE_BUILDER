import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSubjects, fetchSemester } from '../api';
import { FiBook, FiArrowLeft, FiChevronRight } from 'react-icons/fi';

const SemesterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [subjectsData, semesterData] = await Promise.all([
        fetchSubjects(id),
        fetchSemester(id),
      ]);
      setSubjects(subjectsData);
      setSemester(semesterData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subjectId) => {
    navigate(`/subject/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading subjects...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <FiArrowLeft /> Back to Home
        </button>
        <h1>Semester {semester?.number} - {semester?.name}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="subject-card"
            onClick={() => handleSubjectSelect(subject._id)}
          >
            <div className="subject-header">
              <div className="subject-icon">
                <FiBook />
              </div>
              <div>
                <h3>{subject.code}</h3>
                <p>{subject.name}</p>
              </div>
            </div>
            {subject.teacher && (
              <div className="subject-teacher">
                <small>Teacher: {subject.teacher.name}</small>
              </div>
            )}
            {subject.modules && (
              <div className="subject-modules">
                <small>{subject.modules.length} Module{subject.modules.length !== 1 ? 's' : ''}</small>
              </div>
            )}
            <div className="subject-arrow">
              <FiChevronRight />
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="empty-state">
          <p>No subjects available for this semester.</p>
        </div>
      )}
    </div>
  );
};

export default SemesterView;

