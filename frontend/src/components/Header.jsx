import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * 상단 헤더 컴포넌트
 * - 로그인 상태에 따라 버튼 또는 사용자 정보 표시
 * - 페이지 이동은 useNavigate 사용
 */
function Header({ isLoggedIn, username, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      {/* 🔻 왼쪽: 로고 + 네비게이션 링크 */}
      <div className="header-left">
        <Link to="/" className="logo">MovieRC</Link>
        <nav className="nav-links">
          <Link to="/">영화</Link>
          <Link to="/community">게시판</Link>
        </nav>
      </div>

      {/* 🔻 오른쪽: 로그인 여부에 따라 버튼/유저 정보 표시 */}
      <div className="header-right">
        {isLoggedIn ? (
          <>
            <span className="welcome">{username}님</span>
            <button className="btn" onClick={onLogout}>
              로그아웃
            </button>
            <button className="btn" onClick={() => navigate('/profile')}>
              회원정보
            </button>
          </>
        ) : (
          <>
            <button
              className="btn"
              onClick={() => navigate('/auth', { state: { mode: 'login' } })}
            >
              로그인
            </button>
            <button
              className="btn"
              onClick={() => navigate('/auth', { state: { mode: 'register' } })}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;