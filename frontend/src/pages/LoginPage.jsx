import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, signup } from '../services/api';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillsText, setSkillsText] = useState(''); // New state for skills as text

  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.role) setRole(location.state.role);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let response;
      if (isLogin) {
        const credentials = role === 'mentor' ? { mentor_mail: email, password } : { student_mail: email, password };
        response = await login(role, credentials);
      } else {
        const userData = role === 'mentor' 
          ? { mentor_name: name, mentor_mail: email, password } 
          : { student_name: name, student_mail: email, password, skills: skillsText }; // Pass skills as a string
        response = await signup(role, userData);
      }
      loginUser(response.data);
      navigate(role === 'mentor' ? '/mentor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="hero min-h-[80vh] bg-base-100">
      <div className="card w-full max-w-lg shrink-0 bg-base-200 shadow-2xl">
        <form className="card-body" onSubmit={handleSubmit}>
          <Link to="/" className="btn btn-ghost btn-sm self-start">← Choose Role</Link>

          <h1 className="card-title text-2xl capitalize">{role} {isLogin ? 'Login' : 'Sign Up'}</h1>
          
          {!isLogin && (
            <div className="form-control">
              <label className="label"><span className="label-text">Name</span></label>
              <input type="text" placeholder="Your Name" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input type="email" placeholder="email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Password</span></label>
            <input type="password" placeholder="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* Text input for skills during student signup */}
          {!isLogin && role === 'student' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Skills</span>
              </label>
              <input 
                  type="text"
                  placeholder="e.g., React, Node.js, SQL"
                  className="input input-bordered"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
              />
              <div className="label">
                  <span className="label-text-alt">Enter skills separated by commas</span>
              </div>
            </div>
          )}

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">{isLogin ? 'Login' : 'Sign Up'}</button>
          </div>
          <div className="divider text-sm">Or</div>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn btn-link p-0 self-center">
            {isLogin ? `Need an account? Sign Up` : `Already have an account? Login`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;