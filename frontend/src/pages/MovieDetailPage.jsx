import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import './MovieDetailPage.css';
import { ClipLoader } from 'react-spinners';

// 날짜 포맷 함수
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    + ' ' +
    date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ottList, setOttList] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', is_spoiler: false, images: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '', is_spoiler: false });
  const [showSpoiler, setShowSpoiler] = useState({});
  const [reviewVoteStatus, setReviewVoteStatus] = useState({});

  // 항상 최신 토큰/유저명 불러오기 (함수형: useState 대신 매번 getItem)
  const getToken = () => localStorage.getItem('access');
  const getCurrentUser = () => localStorage.getItem('username');

  // OTT 목록 불러오기
  useEffect(() => {
    axios.get('/ott/')
      .then(res => setOttList(res.data))
      .catch(err => console.error('OTT 목록 불러오기 실패:', err));
  }, []);

  // 영화 상세 + 리뷰 데이터
  const fetchMovieDetail = async () => {
    try {
      const response = await axios.get(`/movies/${id}/`);
      setMovie(response.data);
    } catch (error) {
      console.error('영화 정보를 불러오지 못했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMovieDetail();
  }, [id]);

  // 리뷰 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('movie', id);
      formData.append('rating', newReview.rating);
      formData.append('comment', newReview.comment);
      formData.append('is_spoiler', newReview.is_spoiler);
      for (let i = 0; i < (newReview.images?.length || 0); i++) {
        formData.append('images', newReview.images[i]);
      }
      await axios.post(
        `/reviews/`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' } }
      );
      setNewReview({ rating: 5, comment: '', is_spoiler: false, images: [] });
      fetchMovieDetail();
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        alert(error.response.data.non_field_errors[0]);
      } else {
        alert('리뷰 작성 실패');
      }
    }
    setIsSubmitting(false);
  };

  // 추천/비추천
  const handleVote = async (reviewId, type) => {
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');
    if (reviewVoteStatus[reviewId]) return alert('이미 반영한 투표입니다.');
    try {
      await axios.post(
        `/reviews/${reviewId}/${type}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewVoteStatus({ ...reviewVoteStatus, [reviewId]: true });
      fetchMovieDetail();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('이미 반영한 투표입니다.');
        setReviewVoteStatus({ ...reviewVoteStatus, [reviewId]: true });
      } else {
        alert('추천/비추천 실패');
      }
    }
  };

  // 스포일러 토글
  const handleSpoilerToggle = (reviewId) => {
    setShowSpoiler(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // 리뷰 수정 시작/취소/저장
  const startEditing = (review) => {
    setEditReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment, is_spoiler: review.is_spoiler });
  };
  const cancelEditing = () => {
    setEditReviewId(null);
    setEditReviewData({ rating: 5, comment: '', is_spoiler: false });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/reviews/${editReviewId}/`,
        editReviewData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      cancelEditing();
      fetchMovieDetail();
    } catch (error) {
      alert('리뷰 수정 실패');
    }
  };
  // 리뷰 삭제
  const handleDelete = async (reviewId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/reviews/${reviewId}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchMovieDetail();
    } catch (error) {
      alert('리뷰 삭제 실패');
    }
  };

  // Top 리뷰/전체 리뷰
  const getTopReviews = () => {
    if (!movie?.reviews) return [];
    return [...movie.reviews]
      .map(r => ({ ...r, voteDiff: (r.like_count || 0) - (r.dislike_count || 0) }))
      .filter(r => r.voteDiff >= 10)
      .sort((a, b) => b.voteDiff - a.voteDiff)
      .slice(0, 3);
  };
  const getAllReviews = () => movie?.reviews || [];

  // 별점 표시
  const renderStars = (score) => {
    const stars = [];
    let full = Math.floor(score);
    let half = score % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars.push(<span key={i}>★</span>);
    if (half) stars.push(<span key="half">☆</span>);
    for (let i = stars.length; i < 5; i++) stars.push(<span key={i + 10}>☆</span>);
    return <span className="star-rating">{stars}</span>;
  };

  // 리뷰 카드
  const renderReviewCard = (review, isTop = false) => {
    const isSpoiler = review.is_spoiler;
    const spoilerHidden = isSpoiler && !showSpoiler[review.id];
    // 서버에서 is_owner 제공시: 그걸 사용, 아니면 user 비교
    const isOwner = review.is_owner !== undefined
      ? review.is_owner
      : (getCurrentUser() && review.user === getCurrentUser());

    return (
      <div key={review.id} className={`review-card${isTop ? ' top-review' : ''}`}>
        <div className="review-header">
          <span className="review-author">{review.user}</span>
          <span className="review-date">{formatDate(review.created_at)}</span>
          {isTop && <span className="top-label">Top</span>}
        </div>
        <div className="review-rating">
          {renderStars(review.rating)} <span className="score">{review.rating} / 5</span>
        </div>
        <div className="review-actions-bar">
          <button
            className="vote-btn up"
            onClick={() => handleVote(review.id, 'like')}
            disabled={reviewVoteStatus[review.id]}
          >
            <span className="vote-icon" role="img" aria-label="추천">👍</span>
            <span>추천</span>
            <span className="vote-count">{review.like_count || 0}</span>
          </button>
          <button
            className="vote-btn down"
            onClick={() => handleVote(review.id, 'dislike')}
            disabled={reviewVoteStatus[review.id]}
          >
            <span className="vote-icon" role="img" aria-label="비추천">👎</span>
            <span>비추천</span>
            <span className="vote-count">{review.dislike_count || 0}</span>
          </button>
        </div>
        {/* 이미지 첨부 */}
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((img, idx) => (
              <img
                key={idx}
                src={img.image_url || img.url}
                alt="리뷰 이미지"
                className="review-image-thumb"
              />
            ))}
          </div>
        )}
        {/* 스포일러 분리 처리 */}
        {isSpoiler ? (
          <div className="review-content spoiler">
            <span className="spoiler-label">스포일러 포함</span>
            {spoilerHidden ? (
              <button
                className="show-spoiler-btn"
                onClick={(e) => { e.stopPropagation(); handleSpoilerToggle(review.id); }}>
                내용 보기
              </button>
            ) : null}
            <span className={spoilerHidden ? 'blurred' : ''} style={{marginLeft: '16px'}}>
              {review.comment}
            </span>
          </div>
        ) : (
          <div className="review-content">{review.comment}</div>
        )}
        {/* 본인만 수정/삭제 */}
        {isOwner && (
          <div className="review-actions">
            {editReviewId === review.id ? (
              <form onSubmit={handleEditSubmit} className="review-form">
                <div className="review-form-group review-form-group-horizontal">
                  <label htmlFor="edit-rating">평점</label>
                  <select
                    id="edit-rating"
                    value={editReviewData.rating}
                    onChange={e => setEditReviewData({ ...editReviewData, rating: parseFloat(e.target.value) })}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={(i + 1) * 0.5}>{((i + 1) * 0.5).toFixed(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="review-form-group">
                  <label htmlFor="edit-comment">코멘트</label>
                  <textarea
                    id="edit-comment"
                    value={editReviewData.comment}
                    onChange={e => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                  />
                </div>
                <div className="review-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editReviewData.is_spoiler}
                      onChange={e => setEditReviewData({ ...editReviewData, is_spoiler: e.target.checked })}
                    />
                    스포일러 포함
                  </label>
                </div>
                <div className="review-actions">
                  <button type="submit">저장</button>
                  <button type="button" onClick={cancelEditing}>취소</button>
                </div>
              </form>
            ) : (
              <>
                <button onClick={() => startEditing(review)}>수정</button>
                <button onClick={() => handleDelete(review.id)}>삭제</button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <ClipLoader size={60} color="#e50914" />
        <p>영화 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!movie) return <p className="movie-not-found">영화 정보를 찾을 수 없습니다.</p>;

  // ott id → 객체 변환
  const movieOttList = (movie.ott_services || [])
    .map(id => ottList.find(ott => ott.id === id))
    .filter(Boolean);

  return (
    <div className="movie-detail-container">
      {/* 영화 상세 정보 */}
      <div className="movie-info-section">
        <img src={movie.thumbnail_url} alt={movie.title} className="movie-thumbnail" />
        <div className="movie-text-info">
          <h1 className="movie-title">{movie.title}</h1>
          {/* 평균 평점 */}
          <div className="movie-average-rating">
            {renderStars(movie.average_rating)}
            <span className="rating-num">{movie.average_rating} / 5</span>
            <span className="rating-count">({movie.reviews.length}명 참여)</span>
          </div>
          <p className="movie-description">{movie.description}</p>
        </div>
      </div>
      {/* OTT에서 바로 보러가기 */}
      <div className="ott-section">
        <h3>OTT에서 바로 보러가기</h3>
        {movieOttList.length > 0 ? (
          <div className="ott-list">
            {movieOttList.map(ott => (
              ott.link_url ? (
                <a
                  key={ott.id}
                  href={ott.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ott-link"
                  title={ott.name}
                >
                  <img src={ott.logo_url} alt={ott.name} className="ott-logo" />
                </a>
              ) : (
                <span key={ott.id} className="ott-link-disabled" title="링크 없음">
                  <img src={ott.logo_url} alt={ott.name} className="ott-logo" style={{ opacity: 0.5 }} />
                </span>
              )
            ))}
          </div>
        ) : (
          <div className="no-ott">제공하는 OTT가 없습니다.</div>
        )}
      </div>

      {/* 리뷰 작성 */}
      <section className="review-section">
        <h2>리뷰 작성</h2>
        <form onSubmit={handleSubmit} className="review-form" encType="multipart/form-data">
          <div className="review-form-group review-form-group-horizontal">
            <label htmlFor="rating">평점</label>
            <select
              id="rating"
              value={newReview.rating}
              onChange={e => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={(i + 1) * 0.5}>{((i + 1) * 0.5).toFixed(1)}</option>
              ))}
            </select>
          </div>
          <div className="review-form-group">
            <label htmlFor="comment">코멘트</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
            />
          </div>
          <div className="review-form-group">
            <label>
              <input
                type="checkbox"
                checked={newReview.is_spoiler}
                onChange={e => setNewReview({ ...newReview, is_spoiler: e.target.checked })}
              />
              스포일러 포함
            </label>
          </div>
          <div className="review-form-group">
            <label htmlFor="review-image">이미지 첨부</label>
            <input
              id="review-image"
              type="file"
              multiple
              accept="image/*"
              onChange={e =>
                setNewReview({ ...newReview, images: Array.from(e.target.files) })
              }
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성'}
          </button>
        </form>
      </section>

      {/* Top 리뷰 */}
      <section className="review-section">
        <h2>Top 리뷰</h2>
        <div className="reviews">
          {getTopReviews().length === 0 ? (
            <p>Top 리뷰가 없습니다.</p>
          ) : (
            getTopReviews().map(review => renderReviewCard(review, true))
          )}
        </div>
      </section>

      {/* 전체 리뷰 */}
      <section className="review-section">
        <h2>전체 리뷰</h2>
        <div className="reviews">
          {getAllReviews().length === 0 ? (
            <p>다른 리뷰가 없습니다.</p>
          ) : (
            getAllReviews().map(review => renderReviewCard(review, false))
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetailPage;