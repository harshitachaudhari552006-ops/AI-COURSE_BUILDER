import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestOTP, verifyOTP } from '../api';
import { FiMail, FiPhone, FiLock, FiUser } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    mobile: '',
    otp: '',
  });

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestOTP({
        studentId: formData.studentId,
        email: formData.email,
        mobile: formData.mobile,
      });
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyOTP({
        studentId: formData.studentId,
        otp: formData.otp,
      });
      login(response.token, response.student);
      window.location.href = '/';
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
          <h1>🎓 Saraswati College of Engineering</h1>
          <h2>AI Course Builder</h2>
          <p>Login to access your learning materials</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 'request' ? (
          <form onSubmit={handleRequestOTP} className="login-form">
            <div className="form-group">
              <label>
                <FiUser /> Student ID
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="Enter your Student ID"
                required
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending OTP...' : 'Request OTP'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              New user? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register Now</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="form-group">
              <label>
                <FiLock /> Enter OTP
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                autoFocus
              />
              <small>OTP sent to {formData.email || formData.mobile}</small>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="btn btn-link"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

