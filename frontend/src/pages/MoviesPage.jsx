import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import './MoviesPage.css';
import { useNavigate } from 'react-router-dom';

const MoviesPage = ({ isLoggedIn }) => {
  const [movies, setMovies] = useState([]);
  const [ottList, setOttList] = useState([]); // 반드시 배열로!
  const [subscribedOtts, setSubscribedOtts] = useState([]);
  const [selectedOtts, setSelectedOtts] = useState([]);
  const [showOttDropdown, setShowOttDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const navigate = useNavigate();
  const ottDropdownRef = useRef();

  // ▼ 드롭다운 외부 클릭시 닫기
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
      .then(res => {
        const data = Array.isArray(res.data) ? res.data
          : (Array.isArray(res.data.results) ? res.data.results : []);
        setOttList(data);
      })
      .catch(() => setOttList([]));
  }, []);

  // 구독중인 OTT 정보 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      axios.get('/users/profile/')
        .then(res => {
          if (res.data && res.data.subscribed_ott) {
            setSubscribedOtts(res.data.subscribed_ott.map(o => o.id));
          } else {
            setSubscribedOtts([]);
          }
        })
        .catch(() => setSubscribedOtts([]));
    } else {
      setSubscribedOtts([]);
    }
  }, [isLoggedIn]);

  // 페이지, 검색어, 필터, 정렬이 변경될 때마다 영화 목록 불러오기
  useEffect(() => {
    let url = `/movies/search/?page=${page}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedOtts.length > 0) url += `ott_services=${selectedOtts.join(',')}&`;
    if (ordering) url += `ordering=${ordering}&`;

    axios.get(url)
      .then(res => {
        // DRF 페이징 구조에 맞춰서 처리
        setMovies(res.data.results || []);
        setError('');
        setHasNextPage(!!res.data.next);
        setHasPrevPage(!!res.data.previous);
      })
      .catch(() => {
        setError('영화 목록을 불러오는 데 실패했습니다.');
        setMovies([]);
        setHasNextPage(false);
        setHasPrevPage(false);
      });
  }, [search, selectedOtts, ordering, page]);

  // 검색어, 필터, 정렬 변경 시 페이지 1로 초기화
  useEffect(() => {
    setPage(1);
  }, [search, selectedOtts, ordering]);

  const ottArr = Array.isArray(ottList) ? ottList : [];
  const subscribedOttObjs = ottArr.filter(ott => subscribedOtts.includes(ott.id));
  const otherOttObjs = ottArr.filter(ott => !subscribedOtts.includes(ott.id));

  const ottButtonText = selectedOtts.length === 0
    ? 'OTT 전체'
    : ottArr.filter(ott => selectedOtts.includes(ott.id)).map(ott => ott.name).join(', ');

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
        <button onClick={() => setSearch(searchInput)} className="search-button">검색</button>

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

              {isLoggedIn && subscribedOttObjs.length > 0 && (
                <div className="ott-dropdown-group">
                  <div className="dropdown-group-title">구독중인 OTT</div>
                  {subscribedOttObjs.map(item => (
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
                </div>
              )}

              {otherOttObjs.length > 0 && (
                <div className="ott-dropdown-group">
                  {isLoggedIn && subscribedOttObjs.length > 0 && <div className="dropdown-group-title">기타 OTT</div>}
                  {otherOttObjs.map(item => (
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
                </div>
              )}

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

      {error && (
        <p style={{ color: '#e50914', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
      )}

      <div className="movies-grid">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => navigate(`/movies/${movie.id}`)}
          >
            <div className="poster-container">
              <img src={movie.thumbnail_url} alt={movie.title} />
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
                    const service = ottArr.find(o => o.id === ottId);
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
                      .map(ottId => ottArr.find(o => o.id === ottId)?.name)
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

      {/* 페이징 버튼 */}
      <div className="pagination-controls" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <button
          disabled={!hasPrevPage}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          style={{ marginRight: 12 }}
        >
          이전
        </button>
        <span>페이지 {page}</span>
        <button
          disabled={!hasNextPage}
          onClick={() => setPage(prev => prev + 1)}
          style={{ marginLeft: 12 }}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default MoviesPage;