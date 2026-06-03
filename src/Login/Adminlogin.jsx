import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import clinicBg from '../assests/clinic-bg.jpg';
import './styles/Auth.css';
import { apiUrl } from '../config/api';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    <path d="M12 8v4M10 10h4" />
  </svg>
);

const LOGIN_API = apiUrl('Auth/login');

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload || typeof atob !== 'function') {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(normalized + padding));
  } catch {
    return null;
  }
};

const getClaim = (claims, ...keys) => {
  for (const key of keys) {
    if (claims?.[key] !== undefined && claims?.[key] !== null) {
      return claims[key];
    }
  }

  return '';
};

const clearStoredSession = () => {
  [
    'token',
    'adminToken',
    'doctorToken',
    'receptionistToken',
    'adminRole',
    'doctorRole',
    'receptionistRole',
    'userRole',
    'adminEmail',
    'doctorEmail',
    'receptionistEmail',
    'receptionistName',
    'doctorId',
    'doctorName',
    'hospitalId',
    'hospitalName',
  ].forEach((key) => localStorage.removeItem(key));
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page-no-scroll');
    return () => {
      document.body.classList.remove('auth-page-no-scroll');
    };
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const clearError = (field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.api;
      return next;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email ID is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors({
          api: data.message || 'Login failed. Please check your credentials.',
        });
        return;
      }

      if (!data?.token) {
        setErrors({ api: 'Login failed. Token not received from server.' });
        return;
      }

      const claims = decodeJwtPayload(data.token);
      const role =
        data.role ||
        getClaim(
          claims,
          'role',
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        );
      const normalizedRole = String(role || '').toLowerCase();

      if (!['admin', 'doctor', 'receptionist'].includes(normalizedRole)) {
        setErrors({
          api: 'Access denied. This account does not have Admin, Doctor, or Receptionist role.',
        });
        return;
      }

      const displayName =
        getClaim(
          claims,
          'name',
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
        ) ||
        data.name ||
        email.trim();
      const hospitalId =
        data.hospitalId ||
        getClaim(claims, 'HospitalId', 'hospitalId') ||
        '';

      clearStoredSession();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('hospitalId', String(hospitalId));
      localStorage.setItem('hospitalName', data.hospitalName || '');

      if (normalizedRole === 'doctor') {
        localStorage.setItem('doctorToken', data.token);
        localStorage.setItem('doctorRole', role);
        localStorage.setItem('doctorEmail', data.email || email.trim());
        localStorage.setItem('doctorName', displayName);
        localStorage.setItem('doctorId', String(data.doctorId || getClaim(claims, 'DoctorId') || ''));
        navigate('/doctor/dashboard', { replace: true });
        return;
      }

      if (normalizedRole === 'receptionist') {
        localStorage.setItem('receptionistToken', data.token);
        localStorage.setItem('receptionistRole', role);
        localStorage.setItem('receptionistEmail', data.email || email.trim());
        localStorage.setItem('receptionistName', displayName);
        navigate('/reception/dashboard', { replace: true });
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminRole', role);
      localStorage.setItem('adminEmail', data.email || email.trim());
      navigate('/dashboard', { replace: true });
    } catch {
      setErrors({
        api: 'Unable to reach server. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div
        className="auth-bg"
        style={{ backgroundImage: `url(${clinicBg})` }}
        aria-hidden="true"
      />
      <div className="auth-veil" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-logo" aria-hidden="true">
          <LogoIcon />
        </div>

        <h2>Clinic Login</h2>
        <p className="subtitle">Welcome back to the Clinic Portal</p>
        {successMessage ? <p className="success-message">{successMessage}</p> : null}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <input
              id="email"
              type="email"
              placeholder="admin@clinic.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccessMessage('');
                clearError('email');
              }}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSuccessMessage('');
                  clearError('password');
                }}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.api ? <span className="error-message">{errors.api}</span> : null}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link to="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>

        <div className="auth-footer">
          © {new Date().getFullYear()} Clinic Portal · Secure Access
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;




// Add-Migration AddPatientModule
// Update-Database

// use AuthDemoDb;
// select * from Staffs;
// Drop-Database AuthDemoDb;
// select * from Users;

// SELECT * FROM INFORMATION_SCHEMA.TABLES;


// select * from Doctors;
// select * from Schedules;
// select * from Appointments;



// select * from Doctors;
// SELECT * FROM Patients;
// select * from Schedules;
// select * from Appointments;

// delete Schedules where id=1;
