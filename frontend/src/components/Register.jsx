import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent } from '../api';
import { FiUser, FiMail, FiPhone, FiBook, FiHash } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    mobile: '',
    semester: 1,
    department: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerStudent(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎓 Create Account</h1>
          <p>Register as a student to access AI Course Builder</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{ color: 'var(--success)', marginBottom: '20px', padding: '12px', background: '#e8f5e9', borderRadius: '8px' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><FiHash /> Student ID</label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g. S12345"
              required
            />
          </div>

          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label><FiPhone /> Mobile</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="form-group">
            <label><FiBook /> Current Semester (1-8)</label>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label><FiBook /> Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Engineering"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
