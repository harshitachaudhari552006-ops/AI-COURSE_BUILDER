import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchModule,
  fetchMaterials,
  fetchAIContent,
  generateExtraNotes,
  generateNumericals,
  generateExamPoints,
  generateYouTubeLinks,
  generatePredictedQuestions,
  downloadMaterial,
  chatWithAI,
  updateModuleYouTubeLinks,
  updateModuleNPTELUrls,
  uploadMaterial,
} from '../api';
import { FiArrowLeft, FiFileText, FiDownload, FiSearch, FiYoutube, FiBook, FiZap, FiSend, FiPlus, FiTrash2, FiSave, FiExternalLink } from 'react-icons/fi';
import ReactPlayer from 'react-player';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[1].length === 11) ? match[1] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getGoogleDriveEmbedUrl = (url) => {
  if (!url) return null;
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return null;
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const ModuleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [aiContent, setAiContent] = useState(null);
  const [searchTopic, setSearchTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('materials');
  const [youtubeUrls, setYoutubeUrls] = useState([]);
  const [nptelUrls, setNptelUrls] = useState([]);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isEditingNptel, setIsEditingNptel] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newNptelUrl, setNewNptelUrl] = useState('');
  
  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [moduleData, materialsData] = await Promise.all([
        fetchModule(id),
        fetchMaterials(id),
      ]);
      setModule(moduleData);
      setMaterials(materialsData);
      setYoutubeUrls(moduleData.youtubeUrls || []);
      setNptelUrls(moduleData.nptelUrls || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const blob = await downloadMaterial(materialId);
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

  const handleSearchTopic = async () => {
    if (!searchTopic.trim()) return;

    setAiLoading(true);
    setError('');

    try {
      // Fetch or generate AI content
      let content;
      try {
        content = await fetchAIContent(id, searchTopic);
      } catch (err) {
        // If not found, generate new content
        await Promise.all([
          generateExtraNotes(id, { topic: searchTopic }),
          generateNumericals(id, { topic: searchTopic, count: 5 }),
          generateExamPoints(id, { topic: searchTopic }),
          generateYouTubeLinks(id, { topic: searchTopic }),
        ]);
        content = await fetchAIContent(id, searchTopic);
      }

      setAiContent(content);
      setChatHistory([
        { role: 'ai', content: `Hello! I've prepared some materials for ${searchTopic}. You can ask me anything about this topic!` }
      ]);
      setActiveSection('ai');
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    try {
      const response = await chatWithAI(id, {
        topic: searchTopic,
        question: userMessage,
        history: chatHistory
      });
      setChatHistory(prev => [...prev, { role: 'ai', content: response.answer }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setChatHistory(prev => [...prev, { role: 'ai', content: `Oops! I'm having a little trouble connecting to my brain right now. Error: ${errorMessage}.` }]);
      setError('Chat failed: ' + errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!searchTopic.trim() || !module?.subject) return;

    setAiLoading(true);
    try {
      await generatePredictedQuestions({
        subjectId: module.subject._id,
        moduleId: id,
        topic: searchTopic,
        count: 10,
      });
      alert('Questions generated successfully! Check the Questions section.');
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddYoutubeLink = async () => {
    if (!newUrl.trim()) return;
    
    const updatedUrls = [...youtubeUrls, newUrl.trim()];
    try {
      setLoading(true);
      await updateModuleYouTubeLinks(id, updatedUrls);
      setYoutubeUrls(updatedUrls);
      setNewUrl('');
      setIsEditingLinks(false);
    } catch (err) {
      setError('Failed to add video: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveYoutubeLink = async (index) => {
    const updatedUrls = youtubeUrls.filter((_, i) => i !== index);
    try {
      setLoading(true);
      await updateModuleYouTubeLinks(id, updatedUrls);
      setYoutubeUrls(updatedUrls);
    } catch (err) {
      setError('Failed to remove video: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNptelLink = async () => {
    if (!newNptelUrl.trim()) return;
    
    const updatedUrls = [...nptelUrls, newNptelUrl.trim()];
    try {
      setLoading(true);
      await updateModuleNPTELUrls(id, updatedUrls);
      setNptelUrls(updatedUrls);
      setNewNptelUrl('');
      setIsEditingNptel(false);
    } catch (err) {
      setError('Failed to add NPTEL video: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNptelLink = async (index) => {
    const updatedUrls = nptelUrls.filter((_, i) => i !== index);
    try {
      setLoading(true);
      await updateModuleNPTELUrls(id, updatedUrls);
      setNptelUrls(updatedUrls);
    } catch (err) {
      setError('Failed to remove NPTEL video: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type) => {
    if (!newFile || !newTitle.trim()) {
      alert('Please provide a title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('title', newTitle.trim());
    formData.append('moduleId', id);
    formData.append('type', type);
    formData.append('description', `User uploaded ${type.replace('_', ' ')}`);

    setUploadLoading(true);
    try {
      await uploadMaterial(formData);
      // Refresh materials
      const materialsData = await fetchMaterials(id);
      setMaterials(materialsData);
      // Reset form
      setNewFile(null);
      setNewTitle('');
      alert('File uploaded successfully!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading module...</div>
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
          <h1>{module?.title?.startsWith('Module') ? module.title : `Module ${module?.number}: ${module?.title}`}</h1>
          <div className="module-meta">
            {module?.subject?.name && <span>{module.subject.name}</span>}
            {module?.subject?.teacher?.name && (
              <span className="teacher-tag">Teacher: {module.subject.teacher.name}</span>
            )}
          </div>
          {module?.description && <p className="module-description">{module.description}</p>}
        </div>
      </div>

      {/* Topic Search Bar */}
      <div className="topic-search">
        <div className="search-input-group">
          <FiSearch />
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            placeholder="Search topic to start AI learning assistant..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearchTopic()}
          />
          <button onClick={handleSearchTopic} disabled={aiLoading} className="btn btn-primary">
            {aiLoading ? 'Loading...' : 'Start Session'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeSection === 'materials' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('materials')}
        >
          <FiFileText /> Official Materials
        </button>
        <button
          className={activeSection === 'videos' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('videos')}
        >
          <FiYoutube /> Videos
        </button>
        <button
          className={activeSection === 'nptel' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('nptel')}
        >
          <FiYoutube /> NPTEL
        </button>
        <button
          className={activeSection === 'extra_notes' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('extra_notes')}
        >
          <FiFileText /> Extra Notes
        </button>
        <button
          className={activeSection === 'research_papers' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('research_papers')}
        >
          <FiBook /> Research Papers
        </button>
        <button
          className={activeSection === 'ai' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('ai')}
        >
          <FiZap /> AI Tutor
        </button>
      </div>

      {/* Materials Section */}
      {activeSection === 'materials' && (
        <div className="materials-list">
          {materials.filter(m => ['PDF', 'PPT', 'TEXT', 'VIDEO'].includes(m.type)).map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-icon">
                {material.type === 'PDF' && <FiFileText />}
                {material.type === 'PPT' && <FiFileText />}
                {material.type === 'TEXT' && <FiBook />}
              </div>
              <div className="material-info">
                <h3>{material.title}</h3>
                <div className="material-meta">
                  <span>{material.type}</span>
                  <span>{(material.fileSize / 1024).toFixed(2)} KB</span>
                  {material.uploadedBy && (
                    <span>By {material.uploadedBy.name}</span>
                  )}
                </div>
                {material.description && !material.description.includes('Imported from S3') && (
                  <p>{material.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDownload(material._id, material.fileName)}
                className="btn btn-primary btn-sm"
              >
                <FiDownload /> Download
              </button>
            </div>
          ))}
          {materials.filter(m => ['PDF', 'PPT', 'TEXT', 'VIDEO'].includes(m.type)).length === 0 && (
            <div className="empty-state">
              <p>No official materials available for this module.</p>
            </div>
          )}
        </div>
      )}

      {/* Extra Notes Section */}
      {activeSection === 'extra_notes' && (
        <div className="materials-section">
          <div className="upload-container" style={{ background: '#f0f4f8', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3>Upload Extra Notes (PDF/PPT)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="Title for notes..." 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input 
                type="file" 
                onChange={(e) => setNewFile(e.target.files[0])}
                style={{ padding: '8px' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => handleFileUpload('EXTRA_NOTES')}
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="materials-list">
            {materials.filter(m => m.type === 'EXTRA_NOTES').map((material) => (
              <div key={material._id} className="material-card">
                <div className="material-icon"><FiFileText /></div>
                <div className="material-info">
                  <h3>{material.title}</h3>
                  <div className="material-meta">
                    <span>{(material.fileSize / 1024).toFixed(2)} KB</span>
                    {material.uploadedBy && <span>By {material.uploadedBy.name}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(material._id, material.fileName)}
                  className="btn btn-primary btn-sm"
                >
                  <FiDownload /> Download
                </button>
              </div>
            ))}
            {materials.filter(m => m.type === 'EXTRA_NOTES').length === 0 && (
              <div className="empty-state">
                <p>No extra notes uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Research Papers Section */}
      {activeSection === 'research_papers' && (
        <div className="materials-section">
          <div className="upload-container" style={{ background: '#fdf2f2', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3>Upload IEEE Research Paper (PDF)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="Paper Title..." 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input 
                type="file" 
                onChange={(e) => setNewFile(e.target.files[0])}
                style={{ padding: '8px' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => handleFileUpload('RESEARCH_PAPER')}
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="materials-list">
            {materials.filter(m => m.type === 'RESEARCH_PAPER').map((material) => (
              <div key={material._id} className="material-card">
                <div className="material-icon"><FiBook /></div>
                <div className="material-info">
                  <h3>{material.title}</h3>
                  <div className="material-meta">
                    <span>{(material.fileSize / 1024).toFixed(2)} KB</span>
                    {material.uploadedBy && <span>By {material.uploadedBy.name}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(material._id, material.fileName)}
                  className="btn btn-primary btn-sm"
                >
                  <FiDownload /> Download
                </button>
              </div>
            ))}
            {materials.filter(m => m.type === 'RESEARCH_PAPER').length === 0 && (
              <div className="empty-state">
                <p>No research papers uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NPTEL Videos Section */}
      {activeSection === 'nptel' && (
        <div className="videos-container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>NPTEL Videos ({nptelUrls.length})</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditingNptel(!isEditingNptel)}
            >
              {isEditingNptel ? 'Cancel' : <><FiPlus /> Add NPTEL Video</>}
            </button>
          </div>

          {isEditingNptel && (
            <div className="add-video-form" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newNptelUrl}
                  onChange={(e) => setNewNptelUrl(e.target.value)}
                  placeholder="Paste NPTEL video/YouTube URL here..."
                  style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <button onClick={handleAddNptelLink} className="btn btn-primary">
                  <FiSave /> Save Link
                </button>
              </div>
            </div>
          )}

          <div className="videos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
            {nptelUrls.map((url, index) => (
              <div key={index} className="video-card" style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)', position: 'relative' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {getYoutubeEmbedUrl(url) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={getYoutubeEmbedUrl(url)}
                          title={`NPTEL YouTube video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      ) : getGoogleDriveEmbedUrl(url) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={getGoogleDriveEmbedUrl(url)}
                          title={`NPTEL Drive video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      ) : (url.includes('share.google') || url.includes('photos.google.com')) ? (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: '#1a1a1a', 
                          color: '#fff',
                          textAlign: 'center',
                          padding: '20px'
                        }}>
                          <FiYoutube style={{ fontSize: '48px', color: '#ff4d4d', marginBottom: '15px' }} />
                          <h4 style={{ margin: '0 0 10px 0' }}>Google Shared Video</h4>
                          <p style={{ fontSize: '13px', color: '#aaa', maxWidth: '300px', margin: '0 0 20px 0' }}>
                            Google restricts this video from playing directly inside other apps for security.
                          </p>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '14px' }}
                          >
                            <FiExternalLink /> Open Video Externally
                          </a>
                        </div>
                      ) : (
                        <ReactPlayer 
                          url={url} 
                          width="100%" 
                          height="100%" 
                          controls={true}
                        />
                      )}
                   </div>
                </div>
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none' }}
                      title="Open video in new tab if it doesn't play here"
                    >
                      {url} <FiExternalLink style={{ fontSize: '12px', marginLeft: '4px' }} />
                    </a>
                  </div>
                  <button 
                    onClick={() => handleRemoveNptelLink(index)} 
                    style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {nptelUrls.length === 0 && !isEditingNptel && (
            <div className="empty-state">
              <FiYoutube style={{ fontSize: '48px', color: '#ccc', marginBottom: '10px' }} />
              <p>No NPTEL videos added yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Videos Section */}
      {activeSection === 'videos' && (
        <div className="videos-container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Module Videos ({youtubeUrls.length})</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditingLinks(!isEditingLinks)}
            >
              {isEditingLinks ? 'Cancel' : <><FiPlus /> Add Video</>}
            </button>
          </div>

          {isEditingLinks && (
            <div className="add-video-form" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Paste YouTube video URL here..."
                  style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <button onClick={handleAddYoutubeLink} className="btn btn-primary">
                  <FiSave /> Save Video
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
            </div>
          )}

          <div className="videos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
            {youtubeUrls.map((url, index) => (
              <div key={index} className="video-card" style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)', position: 'relative' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {getYoutubeEmbedUrl(url) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={getYoutubeEmbedUrl(url)}
                          title={`YouTube video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <ReactPlayer 
                          url={url} 
                          width="100%" 
                          height="100%" 
                          controls={true}
                        />
                      )}
                   </div>
                </div>
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{url}</span>
                  <button 
                    onClick={() => handleRemoveYoutubeLink(index)} 
                    style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Remove Video"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {youtubeUrls.length === 0 && !isEditingLinks && (
            <div className="empty-state">
              <FiYoutube style={{ fontSize: '48px', color: '#ccc', marginBottom: '10px' }} />
              <p>No videos have been added to this module yet.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '20px' }}
                onClick={() => setIsEditingLinks(true)}
              >
                Add Your First Video
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Chatbot Section */}
      {activeSection === 'ai' && (
        <div className="ai-chatbot-section">
          {!searchTopic ? (
            <div className="empty-state">
              <p>Enter a topic in the search bar above to start chatting with the AI tutor.</p>
            </div>
          ) : (
            <div className="ai-chat-container">
              <div className="chat-messages">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`message message-${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                {aiLoading && (
                  <div className="message message-ai">
                    <div className="typing-indicator">AI is thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleChat} className="chat-input-area">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this topic..."
                  disabled={aiLoading}
                />
                <button type="submit" className="btn btn-primary" disabled={aiLoading || !chatInput.trim()}>
                  <FiSend />
                </button>
              </form>

              {/* Quick AI resources as small widgets below chat */}
              {aiContent && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--light-gray)', display: 'flex', gap: '10px', overflowX: 'auto', background: '#f5f5f5' }}>
                   <div style={{ background: 'white', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => setChatInput('Show me some numericals for this topic')}>
                      🔢 Numerical Problems
                   </div>
                   <div style={{ background: 'white', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => setChatInput('What are the key exam points?')}>
                      ⭐ Key Points
                   </div>
                   <div style={{ background: 'white', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => setChatInput('Suggest some YouTube videos')}>
                      🎥 Video Resources
                   </div>
                   <div style={{ background: 'white', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={handleGenerateQuestions}>
                      ❓ Predicted Questions
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleView;

