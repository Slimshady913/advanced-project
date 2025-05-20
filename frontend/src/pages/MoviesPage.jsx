import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import './MoviesPage.css';
import { useNavigate } from 'react-router-dom';

/**
 * MoviesPage: 영화 목록 화면
 * - 검색, OTT 필터, 정렬 기능 제공
 * - 클릭 시 상세 페이지로 이동
 */
const MoviesPage = ({ isLoggedIn }) => {
  const [movies, setMovies] = useState([]);
  const [ottList, setOttList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ott, setOtt] = useState('');
  const [ordering, setOrdering] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 📺 OTT 목록 불러오기
  useEffect(() => {
    axios.get('/ott/')
      .then(res => setOttList(res.data))
      .catch(err => console.error('OTT 목록 불러오기 실패:', err));
  }, []);

  // 🎞️ 영화 목록 불러오기
  useEffect(() => {
    let url = '/movies/search/?';
    if (search) url += `search=${search}&`;

    if (ott === 'subscribed') {
      url += `subscribed_only=true&`; // 🔐 구독 OTT 필터링
    } else if (ott) {
      url += `ott_services=${ott}&`;
    }

    if (ordering) url += `ordering=${ordering}&`;

    axios.get(url)
      .then(res => {
        setMovies(res.data);
        res.data.forEach(m => {
          console.log(m.title, m.ott_services);
        });
        setError('');
      })
      .catch(err => {
        console.error('영화 목록 불러오기 실패:', err);
        setError('영화 목록을 불러오는 데 실패했습니다.');
      });
  }, [search, ott, ordering]);

  return (
    <div className="movies-page">
      <h2 className="text-2xl font-bold mb-4">영화 탐색</h2>

      {/* 🔍 검색 및 필터 UI */}
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

        {/* 🎛️ OTT 드롭다운 - 구독 필터 포함 */}
        <select value={ott} onChange={e => setOtt(e.target.value)}>
          <option value="">OTT 전체</option>
          {isLoggedIn && <option value="subscribed">구독 중인 OTT</option>}
          {ottList.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* ↕️ 정렬 옵션 */}
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
              <p className="rating">⭐ {movie.average_rating}
                <span className="rating-count">
                  ({movie.review_count}명 참여)
                </span>
              </p>

              {/* 📺 영화별 OTT 플랫폼 로고 */}
              <div className="ott-logos">
                {movie.ott_services?.map(ottId => {
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;