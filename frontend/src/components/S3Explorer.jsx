import { useState, useEffect } from 'react';
import { fetchS3Objects, linkS3Object, linkQuestionPaper, fetchSemesters, fetchSubjects, fetchModules } from '../api';
import { FiFolder, FiFile, FiLink, FiCheck, FiSearch, FiRefreshCw, FiBook, FiFileText } from 'react-icons/fi';

const S3Explorer = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Linking state
  const [linkingObject, setLinkingObject] = useState(null);
  const [linkType, setLinkType] = useState('NOTE'); // NOTE or PAPER
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedMod, setSelectedMod] = useState('');
  
  // Paper specific state
  const [paperYear, setPaperYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState('END_SEM');
  
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    loadObjects();
    loadSemesters();
  }, []);

  const loadObjects = async () => {
    try {
      setLoading(true);
      const data = await fetchS3Objects();
      setObjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSemesters = async () => {
    try {
      const data = await fetchSemesters();
      setSemesters(data);
    } catch (err) {
      console.error('Failed to load semesters:', err);
    }
  };

  const handleSemChange = async (e) => {
    const semId = e.target.value;
    setSelectedSem(semId);
    setSelectedSub('');
    setSelectedMod('');
    if (semId) {
      const data = await fetchSubjects(semId);
      setSubjects(data);
    } else {
      setSubjects([]);
    }
  };

  const handleSubChange = async (e) => {
    const subId = e.target.value;
    setSelectedSub(subId);
    setSelectedMod('');
    if (subId) {
      const data = await fetchModules(subId);
      setModules(data);
    } else {
      setModules([]);
    }
  };

  const handleLink = async () => {
    if (!selectedSub || !linkingObject) return;
    if (linkType === 'NOTE' && !selectedMod) return;

    setLinkLoading(true);
    try {
      const fileName = linkingObject.Key.split('/').pop();
      const title = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').trim();
      
      if (linkType === 'NOTE') {
        await linkS3Object({
          moduleId: selectedMod,
          title: title,
          type: fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'PPT',
          s3Key: linkingObject.Key,
          fileSize: linkingObject.Size
        });
      } else {
        const semObj = semesters.find(s => s._id === selectedSem);
        await linkQuestionPaper({
          subjectId: selectedSub,
          title: title,
          year: paperYear,
          semester: semObj ? semObj.number : 1,
          examType: examType,
          s3Key: linkingObject.Key,
          fileSize: linkingObject.Size
        });
      }
      
      alert(`Successfully linked back as ${linkType}!`);
      setLinkingObject(null);
    } catch (err) {
      alert('Error linking: ' + err.message);
    } finally {
      setLinkLoading(false);
    }
  };

  const filteredObjects = objects.filter(obj => 
    obj.Key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Fetching notes from AWS...</div>;

  return (
    <div className="container" style={{ color: 'white' }}>
      <div className="page-header" style={{ marginBottom: '30px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none' }}>
        <h1 style={{ color: 'white' }}>AWS S3 Notes Explorer</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Browse and link notes or question papers from your S3 bucket.</p>
      </div>

      <div className="topic-search" style={{ marginBottom: '20px', background: 'white' }}>
        <div className="search-input-group">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search files in S3 (e.g., 'DAV', 'Module', 'Question')..." 
            value={searchTerm}
            style={{ color: 'black' }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={loadObjects} className="btn btn-icon" title="Refresh">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="materials-list">
        {filteredObjects.length === 0 && <div className="empty-state" style={{ color: 'white' }}>No matching files found in S3 bucket.</div>}
        
        {filteredObjects.map((obj, idx) => (
          <div key={idx} className="material-card" style={{ display: 'flex', justifyContent: 'space-between', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FiFile style={{ fontSize: '24px', color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--dark)' }}>{obj.Key.split('/').pop()}</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>Path: {obj.Key}</p>
                <p style={{ fontSize: '12px', color: '#999' }}>Size: {(obj.Size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setLinkingObject(obj);
                // Pre-select type based on path
                if (obj.Key.toLowerCase().includes('question') || obj.Key.toLowerCase().includes('/qp/')) {
                  setLinkType('PAPER');
                } else {
                  setLinkType('NOTE');
                }
              }}
            >
              <FiLink /> Link to Platform
            </button>
          </div>
        ))}
      </div>

      {/* Linking Modal */}
      {linkingObject && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Link to Platform</h2>
            <p style={{ margin: '10px 0 20px', fontSize: '14px', color: '#666' }}>
              Configure link for: <strong>{linkingObject.Key.split('/').pop()}</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                className={`btn btn-sm ${linkType === 'NOTE' ? 'btn-primary' : ''}`}
                style={{ flex: 1, background: linkType === 'NOTE' ? 'var(--primary)' : '#eee', color: linkType === 'NOTE' ? 'white' : '#666' }}
                onClick={() => setLinkType('NOTE')}
              >
                <FiBook /> Module Note
              </button>
              <button 
                className={`btn btn-sm ${linkType === 'PAPER' ? 'btn-primary' : ''}`}
                style={{ flex: 1, background: linkType === 'PAPER' ? 'var(--primary)' : '#eee', color: linkType === 'PAPER' ? 'white' : '#666' }}
                onClick={() => setLinkType('PAPER')}
              >
                <FiFileText /> Question Paper
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Semester</label>
              <select 
                value={selectedSem} 
                onChange={handleSemChange}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--light-gray)', borderRadius: '5px' }}
              >
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number} - {s.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Subject</label>
              <select 
                value={selectedSub} 
                onChange={handleSubChange}
                disabled={!selectedSem}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--light-gray)', borderRadius: '5px' }}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            {linkType === 'NOTE' ? (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Module</label>
                <select 
                  value={selectedMod} 
                  onChange={(e) => setSelectedMod(e.target.value)}
                  disabled={!selectedSub}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--light-gray)', borderRadius: '5px' }}
                >
                  <option value="">Select Module</option>
                  {modules.map(m => <option key={m._id} value={m._id}>Module {m.number}: {m.title}</option>)}
                </select>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Exam Year</label>
                  <input 
                    type="number" 
                    value={paperYear}
                    onChange={(e) => setPaperYear(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--light-gray)', borderRadius: '5px' }}
                  />
                </div>
                <div className="form-group">
                  <label>Exam Type</label>
                  <select 
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--light-gray)', borderRadius: '5px' }}
                  >
                    <option value="END_SEM">End Sem</option>
                    <option value="MID_SEM">Mid Sem</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </select>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn" onClick={() => setLinkingObject(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleLink}
                disabled={!selectedSub || (linkType === 'NOTE' && !selectedMod) || linkLoading}
              >
                {linkLoading ? 'Linking...' : <><FiCheck /> Confirm Link</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default S3Explorer;
