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
  const [isLoggedIn, setIsLoggedIn] = useState(null); // 인증 초기 상태는 null
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // 인증 정보 초기화
  const initializeAuth = async () => {
    try {
      const res = await axios.get('/users/profile/');
      setIsLoggedIn(true);
      setUserEmail(res.data.email);
      setUsername(res.data.username);
    } catch {
      setIsLoggedIn(false);
      setUserEmail('');
      setUsername(null);
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/users/logout/');
    } catch (e) {}
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
          {/* 영화 메인 페이지 (비로그인 가능) */}
          <Route path="/" element={<MoviesPage isLoggedIn={isLoggedIn} />} />

          {/* 리뷰 목록 (로그인 필요) */}
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

          {/* 인증/회원가입 */}
          <Route path="/auth" element={<AuthPage onLoginSuccess={initializeAuth} />} />

          {/* 영화 상세 (비로그인도 가능) */}
          <Route path="/movies/:id" element={<MovieDetailPage isLoggedIn={isLoggedIn} username={username} />} />
          <Route path="/subscribe" element={<SubscribePage />} />

          {/* 프로필 (로그인 필요) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <ProfilePage setGlobalUsername={setUsername} isLoggedIn={isLoggedIn} username={username} />
              </PrivateRoute>
            }
          />

          {/* 게시판: hot은 기본 리다이렉트 */}
          <Route path="/community" element={<Navigate to="/community/hot" replace />} />

          {/* 게시판 목록 (isLoggedIn, username 전달) */}
          <Route
            path="/community/:category"
            element={
              <BoardListPage
                isLoggedIn={isLoggedIn}
                username={username}
              />
            }
          />

          {/* 게시글 작성 (로그인 필요, props 전달) */}
          <Route
            path="/community/write"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <BoardWritePage isLoggedIn={isLoggedIn} username={username} />
              </PrivateRoute>
            }
          />

          {/* 게시글 수정 (로그인 필요, props 전달) */}
          <Route
            path="/community/edit/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} authReady={authReady}>
                <BoardEditPage isLoggedIn={isLoggedIn} username={username} />
              </PrivateRoute>
            }
          />

          {/* 게시글 상세 (isLoggedIn, username 전달) */}
          <Route
            path="/community/:category/:id"
            element={
              <BoardDetailPage
                isLoggedIn={isLoggedIn}
                username={username}
              />
            }
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;