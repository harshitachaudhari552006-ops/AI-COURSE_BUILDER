import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchModules, fetchSubject, fetchQuestionPapers, downloadQuestionPaper } from '../api';
import { FiArrowLeft, FiFileText, FiDownload, FiBookOpen } from 'react-icons/fi';

const SubjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [modules, setModules] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [activeTab, setActiveTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [subjectData, modulesData, papersData] = await Promise.all([
        fetchSubject(id),
        fetchModules(id),
        fetchQuestionPapers(id),
      ]);
      setSubject(subjectData);
      setModules(modulesData);
      setQuestionPapers(papersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  const handleDownloadPaper = async (paperId, fileName) => {
    try {
      const blob = await downloadQuestionPaper(paperId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading subject details...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <FiArrowLeft /> Back
        </button>
        <div>
          <h1>{subject?.code} - {subject?.name}</h1>
          {subject?.teacher && (
            <p className="subject-meta">Teacher: {subject.teacher.name}</p>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'modules' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('modules')}
        >
          <FiBookOpen /> Modules
        </button>
        <button
          className={activeTab === 'papers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('papers')}
        >
          <FiFileText /> Question Papers
        </button>
      </div>

      {activeTab === 'modules' && (
        <div className="modules-list">
          {modules.map((module) => (
            <div
              key={module._id}
              className="module-card"
              onClick={() => handleModuleSelect(module._id)}
            >
              <div className="module-number">Module {module.number}</div>
              <h3>{module.title}</h3>
              {module.description && <p>{module.description}</p>}
              {module.materials && (
                <div className="module-materials">
                  <small>{module.materials.length} Material{module.materials.length !== 1 ? 's' : ''}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="papers-list">
          {questionPapers.map((paper) => (
            <div key={paper._id} className="paper-card">
              <div className="paper-info">
                <h3>{paper.title}</h3>
                <div className="paper-meta">
                  <span>Year: {paper.year}</span>
                  <span>Semester: {paper.semester}</span>
                  <span>{paper.examType}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownloadPaper(paper._id, paper.fileName)}
                className="btn btn-primary btn-sm"
              >
                <FiDownload /> Download
              </button>
            </div>
          ))}
          {questionPapers.length === 0 && (
            <div className="empty-state">
              <p>No question papers available for this subject.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectView;

