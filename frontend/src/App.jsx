import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
/**
 * App: 루트 컴포넌트
 * - 로그인 상태 체크 및 헤더 렌더링
 * - 라우트 구성: 로그인, 영화 목록/상세, 리뷰, 프로필, 구독 설정
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // 🔐 JWT 토큰 기반 사용자 인증 상태 초기화
  const initializeAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setUserEmail(decoded.email);
        const res = await axios.get('/users/profile/');
        setUsername(res.data.username);
      } catch {
        setIsLoggedIn(false);
        setUserEmail('');
        setUsername(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUsername(null);
    }
    setAuthReady(true);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      {/* 📌 헤더는 authReady 이후부터 렌더링 */}
      {authReady && (
        <Header
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          username={username}
          onLogout={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setUserEmail('');
            setUsername(null);
          }}
        />
      )}

      {/* ⏳ 초기 인증 상태 확인 중일 때 로딩 표시 */}
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
          {/* 🏠 공개: 메인 영화 페이지 */}
          <Route path="/" element={<MoviesPage isLoggedIn={isLoggedIn} />} />

          {/* 🔐 보호: 리뷰 전용 테스트 페이지 */}
          <Route
            path="/reviews"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <div style={{ padding: '2rem', color: 'white' }}>
                  📝 리뷰 페이지입니다 (로그인한 사용자만 볼 수 있습니다)
                </div>
              </PrivateRoute>
            }
          />

          {/* 🔑 로그인/회원가입 페이지 */}
          <Route path="/auth" element={<AuthPage onLoginSuccess={initializeAuth} />} />

          {/* 🎞️ 영화 상세 페이지 */}
          <Route path="/movies/:id" element={<MovieDetailPage />} />

          {/* 📺 OTT 구독 설정 페이지 */}
          <Route path="/subscribe" element={<SubscribePage />} />

          {/* 👤 사용자 프로필 페이지 */}
          <Route
            path="/profile"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <ProfilePage setGlobalUsername={setUsername} />
              </PrivateRoute>
            }
          />
          {/* 🗣️ 커뮤니티 게시판 */}
          <Route path="/community" element={<BoardListPage />} />
          <Route
            path="/community/write"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <BoardWritePage />
              </PrivateRoute>
            }
          />
          <Route path="/community/:id" element={<BoardDetailPage />} />
          <Route
            path="/community/edit/:id"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <BoardEditPage />
              </PrivateRoute>
            }
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;