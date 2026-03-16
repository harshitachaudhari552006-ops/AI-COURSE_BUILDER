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
} from '../api';
import { FiArrowLeft, FiFileText, FiDownload, FiSearch, FiYoutube, FiBook, FiZap, FiSend, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import ReactPlayer from 'react-player';

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
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  
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
          <h1>Module {module?.number}: {module?.title}</h1>
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
          <FiYoutube /> Module Videos
        </button>
        <button
          className={activeSection === 'ai' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('ai')}
        >
          <FiZap /> AI Chatbot
        </button>
      </div>

      {/* Materials Section */}
      {activeSection === 'materials' && (
        <div className="materials-list">
          {materials.map((material) => (
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
                {material.description && <p>{material.description}</p>}
              </div>
              <button
                onClick={() => handleDownload(material._id, material.fileName)}
                className="btn btn-primary btn-sm"
              >
                <FiDownload /> Download
              </button>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="empty-state">
              <p>No materials available for this module.</p>
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
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      <ReactPlayer url={url} width="100%" height="100%" controls={true} />
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

