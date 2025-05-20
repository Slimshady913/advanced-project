import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import './MoviesPage.css';
import { useNavigate } from 'react-router-dom';

/**
 * MoviesPage: 영화 목록 화면 (OTT 필터 체크박스 그룹 → 드롭다운 팝오버)
 */
const MoviesPage = ({ isLoggedIn }) => {
  const [movies, setMovies] = useState([]);
  const [ottList, setOttList] = useState([]);
  const [selectedOtts, setSelectedOtts] = useState([]);
  const [showOttDropdown, setShowOttDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const ottDropdownRef = useRef();

  // 외부 클릭시 OTT 드롭다운 닫힘
  useEffect(() => {
    const handleClick = (e) => {
      if (showOttDropdown && ottDropdownRef.current && !ottDropdownRef.current.contains(e.target)) {
        setShowOttDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOttDropdown]);

  // OTT 목록 불러오기
  useEffect(() => {
    axios.get('/ott/')
      .then(res => setOttList(res.data))
      .catch(() => {});
  }, []);

  // 영화 목록 불러오기
  useEffect(() => {
    let url = '/movies/search/?';
    if (search) url += `search=${search}&`;
    if (selectedOtts.length > 0) url += `ott_services=${selectedOtts.join(',')}&`;
    if (ordering) url += `ordering=${ordering}&`;

    axios.get(url)
      .then(res => {
        setMovies(res.data);
        setError('');
      })
      .catch(() => setError('영화 목록을 불러오는 데 실패했습니다.'));
  }, [search, selectedOtts, ordering]);

  // 드롭다운 버튼용 텍스트
  const ottButtonText = selectedOtts.length === 0
    ? 'OTT 전체'
    : ottList.filter(ott => selectedOtts.includes(ott.id)).map(ott => ott.name).join(', ');

  return (
    <div className="movies-page">
      <h2 className="text-2xl font-bold mb-4">영화 탐색</h2>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="영화 제목 검색"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
        />
        <button
          onClick={() => setSearch(searchInput)}
          className="search-button"
        >
          검색
        </button>
        {/* ▼ OTT 필터 드롭다운 ▼ */}
        <div className="ott-dropdown-wrapper" ref={ottDropdownRef}>
          <button
            className="ott-dropdown-btn"
            type="button"
            onClick={() => setShowOttDropdown(prev => !prev)}
          >
            {ottButtonText} <span className="arrow">{showOttDropdown ? '▲' : '▼'}</span>
          </button>
          {showOttDropdown && (
            <div className="ott-dropdown-list">
              <label className="ott-checkbox all">
                <input
                  type="checkbox"
                  checked={selectedOtts.length === 0}
                  onChange={() => setSelectedOtts([])}
                />
                전체
              </label>
              {ottList.map(item => (
                <label className="ott-checkbox" key={item.id}>
                  <input
                    type="checkbox"
                    checked={selectedOtts.includes(item.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedOtts(prev => [...prev, item.id]);
                      } else {
                        setSelectedOtts(prev => prev.filter(id => id !== item.id));
                      }
                    }}
                  />
                  <img src={item.logo_url} alt={item.name} className="ott-filter-logo" />
                  <span>{item.name}</span>
                </label>
              ))}
              <button
                type="button"
                className="ott-reset-btn"
                onClick={() => setSelectedOtts([])}
              >
                초기화
              </button>
            </div>
          )}
        </div>
        {/* 정렬 드롭다운 */}
        <select value={ordering} onChange={e => setOrdering(e.target.value)}>
          <option value="">정렬 없음</option>
          <option value="-release_date">최신순</option>
          <option value="release_date">오래된순</option>
          <option value="-average_rating_cache">평점 높은순</option>
          <option value="average_rating_cache">평점 낮은순</option>
          <option value="-review_count">리뷰 많은 순</option>
          <option value="title">제목순</option>
        </select>
      </div>
      {/* ⚠️ 에러 메시지 */}
      {error && (
        <p style={{ color: '#e50914', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      {/* 🎬 영화 카드 그리드 */}
      <div className="movies-grid">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => navigate(`/movies/${movie.id}`)}
          >
            <div className="poster-container">
              <img
                src={movie.thumbnail_url}
                alt={movie.title}
              />
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p className="meta">{movie.release_date}</p>
              <p className="rating">
                ⭐ {movie.average_rating}
                <span className="rating-count">({movie.review_count}명 참여)</span>
              </p>
              <div className="ott-logos">
                {movie.ott_services
                  .slice(0, 4)
                  .map(ottId => {
                    const service = ottList.find(o => o.id === ottId);
                    return service ? (
                      <img
                        key={service.id}
                        src={service.logo_url}
                        alt={service.name}
                        title={service.name}
                      />
                    ) : null;
                  })}
                {movie.ott_services.length > 4 && (
                  <span className="ott-more" title={
                    movie.ott_services
                      .slice(4)
                      .map(ottId => ottList.find(o => o.id === ottId)?.name)
                      .filter(Boolean)
                      .join(', ')
                  }>
                    +{movie.ott_services.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;