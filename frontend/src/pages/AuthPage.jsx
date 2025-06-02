import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import './AuthPage.css';
import { ClipLoader } from 'react-spinners';

function AuthPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인/회원가입 모드 전환
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 페이지 전환 시 모드 리셋
  useEffect(() => {
    const nextMode = location.state?.mode;
    if (nextMode === 'register' || nextMode === 'login') {
      setMode(nextMode);
      setErrorMessage('');
    }
  }, [location.key]);

  // 로그인/회원가입 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await axios.post('/users/login/', { email, password });
        // ✅ 서버가 쿠키(HttpOnly)로 JWT 세팅, 별도 토큰 저장 없음
        onLoginSuccess?.();
        navigate('/');
      } else {
        await axios.post('/users/register/', { email, username, password });
        // 회원가입 성공 후 바로 자동 로그인 (쿠키 세팅)
        await axios.post('/users/login/', { email, password });
        onLoginSuccess?.();
        navigate('/subscribe');
      }
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err) {
      let message = mode === 'login' ? '로그인에 실패하였습니다.' : '회원가입에 실패하였습니다.';
      // 에러 메시지 파싱
      if (err.response?.data?.email) {
        if (err.response.data.email[0].includes('already exists')) {
          message = '이미 사용 중인 이메일입니다.';
        } else {
          message = err.response.data.email[0];
        }
      } else if (err.response?.data?.username) {
        if (err.response.data.username[0].includes('already exists')) {
          message = '이미 사용 중인 사용자명입니다.';
        } else {
          message = err.response.data.username[0];
        }
      } else if (err.response?.data?.password) {
        message = err.response.data.password[0];
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {loading && (
        <div className="fullscreen-loading">
          <ClipLoader color="#e50914" size={60} />
          <p className="loading-text">잠시만 기다려주세요...</p>
        </div>
      )}

      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode === 'register' && (
          <input
            type="text"
            placeholder="사용자명"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{mode === 'login' ? '로그인' : '가입하기'}</button>

        {errorMessage && typeof errorMessage === 'string' && errorMessage.trim() !== '' && (
          <p className="error-message">{errorMessage}</p>
        )}

        <p className="toggle-text">
          {mode === 'login' ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}{' '}
          <span
            onClick={() => {
              const nextMode = mode === 'login' ? 'register' : 'login';
              setMode(nextMode);
              setErrorMessage('');
              navigate('/auth', { state: { mode: nextMode } });
            }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default AuthPage;