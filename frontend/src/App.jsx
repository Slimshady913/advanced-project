import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import AuthPage from './pages/AuthPage.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import MoviesPage from './pages/MoviesPage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import SubscribePage from './pages/SubscribePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { ClipLoader } from 'react-spinners';
import axios from './api/axios';
import BoardListPage from './pages/BoardListPage.jsx';
import BoardWritePage from './pages/BoardWritePage.jsx';
import BoardDetailPage from './pages/BoardDetailPage.jsx';
import BoardEditPage from './pages/BoardEditPage.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // ✅ 초기 상태를 null로 설정
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ✅ 쿠키 기반 사용자 인증 상태 확인
  const initializeAuth = async () => {
    try {
      const res = await axios.get('/users/profile/');
      setIsLoggedIn(true);
      setUserEmail(res.data.email);
      setUsername(res.data.username);
    } catch {
      setIsLoggedIn(false); // ❗ 인증 실패는 로그인 안 된 정상 상태
      setUserEmail('');
      setUsername(null);
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    initializeAuth(); // 앱 최초 마운트 시 실행
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/users/logout/');
    } catch (e) {
      // 이미 로그아웃 상태일 수 있음
    }
    setIsLoggedIn(false);
    setUserEmail('');
    setUsername(null);
  };

  return (
    <Router>
      {authReady && (
        <Header
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          username={username}
          onLogout={handleLogout}
        />
      )}

      {!authReady ? (
        <div style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#141414',
          flexDirection: 'column',
          color: 'white',
        }}>
          <ClipLoader color="#e50914" size={60} />
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>잠시만 기다려주세요...</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<MoviesPage isLoggedIn={isLoggedIn} />} />

          <Route
            path="/reviews"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <div style={{ padding: '2rem', color: 'white' }}>
                  📝 리뷰 페이지입니다 (로그인한 사용자만 볼 수 있습니다)
                </div>
              </PrivateRoute>
            }
          />

          <Route path="/auth" element={<AuthPage onLoginSuccess={initializeAuth} />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />

          <Route
            path="/profile"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <ProfilePage setGlobalUsername={setUsername} />
              </PrivateRoute>
            }
          />

          <Route path="/community" element={<Navigate to="/community/hot" replace />} />
          <Route path="/community/:category" element={<BoardListPage />} />
          <Route
            path="/community/write"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <BoardWritePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/community/edit/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <BoardEditPage />
              </PrivateRoute>
            }
          />
          <Route path="/community/:category/:id" element={<BoardDetailPage />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;