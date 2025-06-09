import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import './MovieDetailPage.css';
import { ClipLoader } from 'react-spinners';

// 네이버 웹툰 스타일 Toast
const Toast = React.forwardRef(({ message, duration = 1800 }, ref) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);
  React.useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));
  return visible ? (
    <div className="custom-toast">{message}</div>
  ) : null;
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) +
    ' ' +
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

// ⭐️ 평균 평점용 부분별 함수 (id 고유화)
const renderAverageStars = (score) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    let fillPercent = 0;
    if (score >= i + 1) {
      fillPercent = 100;
    } else if (score > i) {
      fillPercent = (score - i) * 100;
    }
    stars.push(
      <span key={i}>
        <svg width="22" height="22" viewBox="0 0 20 20" style={{ verticalAlign: 'middle' }}>
          <defs>
            <linearGradient id={`star-grad-${i}-avg`}>
              <stop offset={`${fillPercent}%`} stopColor="#ffd700" />
              <stop offset={`${fillPercent}%`} stopColor="#242424" />
            </linearGradient>
          </defs>
          <polygon
            points="10,2 12.6,7.6 18.7,8.3 14,12.4 15.3,18.5 10,15.2 4.7,18.5 6,12.4 1.3,8.3 7.4,7.6"
            fill={`url(#star-grad-${i}-avg)`}
          />
        </svg>
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
};

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ottList, setOttList] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', is_spoiler: false, images: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '', is_spoiler: false, images: [] });
  const [showSpoiler, setShowSpoiler] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [deleteImageIds, setDeleteImageIds] = useState([]); // 삭제할 이미지 id (수정시)
  const toastRef = useRef();
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ordering, setOrdering] = useState('-created_at'); // 기본 최신순

  const getCurrentUser = () => localStorage.getItem('username');

  useEffect(() => {
    axios.get('/ott/')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data
          : (Array.isArray(res.data.results) ? res.data.results : []);
        setOttList(data);
      })
      .catch(() => setOttList([]));
  }, []);

  useEffect(() => {
    if (!modalImageUrl) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setModalImageUrl(null);
      if (modalImages.length > 1) {
        if (e.key === "ArrowLeft") {
          setModalIndex(idx => {
            const newIdx = (idx - 1 + modalImages.length) % modalImages.length;
            setModalImageUrl(modalImages[newIdx]);
            return newIdx;
          });
        }
        if (e.key === "ArrowRight") {
          setModalIndex(idx => {
            const newIdx = (idx + 1) % modalImages.length;
            setModalImageUrl(modalImages[newIdx]);
            return newIdx;
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalImageUrl, modalImages]);

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
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`/reviews/?movie=${id}&ordering=${ordering}`);
      setReviews(Array.isArray(response.data) ? response.data : (Array.isArray(response.data.results) ? response.data.results : []));
    } catch {
      setReviews([]);
    }
    setReviewsLoading(false);
  };
  useEffect(() => {
    if (id) fetchReviews();
  }, [id, ordering]);


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
        { headers: { 'Content-Type': 'multipart/form-data' } } // ✅ Authorization 헤더 제거
      );
      setNewReview({ rating: 5, comment: '', is_spoiler: false, images: [] });
      fetchReviews();  // ✅ 리뷰 새로고침
      fetchMovieDetail();
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
        setToastMsg(error.response.data.non_field_errors[0]);
      } else {
        setToastMsg('리뷰 작성 실패(로그인 필요)');
      }
    }
    setIsSubmitting(false);
  };

  // 추천/비추천
  const handleVote = async (reviewId, type, myVote) => {
    // 로그인 체크 (권장 UX)
    // 실질 인증은 서버에서 쿠키로 처리
    try {
      await axios.post(
        `/reviews/${reviewId}/${type}/`
      );
      fetchReviews();
      fetchMovieDetail();
    } catch (error) {
      setToastMsg('추천/비추천 처리 실패(로그인 필요)');
    }
  };

  const handleSpoilerToggle = (reviewId) => {
    setShowSpoiler((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // 리뷰 수정 관련
  const startEditing = (review) => {
    setEditReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment, is_spoiler: review.is_spoiler, images: [] });
    setDeleteImageIds([]);
  };
  const cancelEditing = () => {
    setEditReviewId(null);
    setEditReviewData({ rating: 5, comment: '', is_spoiler: false, images: [] });
    setDeleteImageIds([]);
  };

  // 이미지 개별 삭제 (수정 폼)
  const handleImageDelete = async (imgId, reviewId) => {
    if (!window.confirm('이미지를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/reviews/review-images/${imgId}/`);
      fetchMovieDetail();
      setToastMsg('이미지가 삭제되었습니다.');
    } catch {
      setToastMsg('이미지 삭제 실패');
    }
  };

  // 리뷰 수정 저장
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('rating', editReviewData.rating);
      formData.append('comment', editReviewData.comment);
      formData.append('is_spoiler', editReviewData.is_spoiler);
      if (editReviewData.images) {
        for (let i = 0; i < editReviewData.images.length; i++) {
          formData.append('images', editReviewData.images[i]);
        }
      }
      if (deleteImageIds.length > 0) {
        formData.append('delete_image_ids', JSON.stringify(deleteImageIds));
      }
      await axios.patch(
        `/reviews/${editReviewId}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } } // ✅ Authorization 헤더 제거
      );
      cancelEditing();
      fetchReviews();
      fetchMovieDetail();
    } catch (error) {
      setToastMsg('리뷰 수정 실패');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/reviews/${reviewId}/`);
      fetchReviews();
      fetchMovieDetail();
    } catch (error) {
      setToastMsg('리뷰 삭제 실패');
    }
  };

  // Top 리뷰/전체 리뷰
  const getTopReviews = () => {
    if (!Array.isArray(reviews)) return [];
    return [...reviews]
      .map(r => ({ ...r, voteDiff: (r.like_count || 0) - (r.dislike_count || 0) }))
      .filter(r => r.voteDiff >= 10)
      .sort((a, b) => b.voteDiff - a.voteDiff)
      .slice(0, 3);
  };

  const getAllReviews = () => reviews || [];

  // ⭐️ 리뷰 별점 표시 (0.5 단위 반별, id 고유화)
  const renderStars = (score, reviewId) => {
    const stars = [];
    const full = Math.floor(score);
    const half = score % 1 >= 0.5;
    for (let i = 0; i < full; i++) {
      stars.push(
        <span key={i}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="#ffd700" style={{ verticalAlign: 'middle' }}>
            <polygon points="10,2 12.6,7.6 18.7,8.3 14,12.4 15.3,18.5 10,15.2 4.7,18.5 6,12.4 1.3,8.3 7.4,7.6" />
          </svg>
        </span>
      );
    }
    if (half) {
      stars.push(
        <span key="half">
          <svg width="22" height="22" viewBox="0 0 20 20" style={{ verticalAlign: 'middle' }}>
            <defs>
              <linearGradient id={`half-grad-${reviewId}`}>
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#242424" />
              </linearGradient>
            </defs>
            <polygon points="10,2 12.6,7.6 18.7,8.3 14,12.4 15.3,18.5 10,15.2 4.7,18.5 6,12.4 1.3,8.3 7.4,7.6" fill={`url(#half-grad-${reviewId})`} />
          </svg>
        </span>
      );
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <span key={i + 10}>
          <svg width="22" height="22" viewBox="0 0 20 20" style={{ verticalAlign: 'middle' }}>
            <polygon points="10,2 12.6,7.6 18.7,8.3 14,12.4 15.3,18.5 10,15.2 4.7,18.5 6,12.4 1.3,8.3 7.4,7.6" fill="#333" />
          </svg>
        </span>
      );
    }
    return <span className="star-rating">{stars}</span>;
  };

  // 리뷰 카드
  const renderReviewCard = (review, isTop = false) => {
    const isSpoiler = review.is_spoiler;
    const spoilerHidden = isSpoiler && !showSpoiler[review.id];
    const isOwner =
      review.is_owner !== undefined
        ? review.is_owner
        : getCurrentUser() && review.user === getCurrentUser();
    const myVote = review.my_vote ?? 0;

    return (
      <div key={review.id} className={`review-card${isTop ? ' top-review' : ''}`}>
        <div className="review-header">
          <span className="review-author">{review.user}</span>
          <span className="review-date">
            {formatDate(review.created_at)}
            {review.is_edited && <span className="review-edited-label"> (수정됨)</span>}
          </span>
          {isTop && <span className="top-label">Top</span>}
        </div>
        <div className="review-rating">
          {renderStars(review.rating, review.id)} <span className="score">{review.rating} / 5</span>
        </div>
        <div className="review-actions-bar webtoon-bar">
          <button
            className={`webtoon-vote-btn up${review.my_vote === 1 ? ' active' : ''}`}
            onClick={() => handleVote(review.id, 'like', review.my_vote)}
            aria-pressed={review.my_vote === 1}
            disabled={review.my_vote === -1}
            type="button"
          >
            <span className="vote-icon" role="img" aria-label="추천">👍</span>
            <span className="vote-count">{review.like_count ?? 0}</span>
          </button>
          <button
            className={`webtoon-vote-btn down${review.my_vote === -1 ? ' active' : ''}`}
            onClick={() => handleVote(review.id, 'dislike', review.my_vote)}
            aria-pressed={review.my_vote === -1}
            disabled={review.my_vote === 1}
            type="button"
          >
            <span className="vote-icon" role="img" aria-label="비추천">👎</span>
            <span className="vote-count">{review.dislike_count ?? 0}</span>
          </button>
        </div>
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            {review.images.map((img, idx) => (
              <img
                key={idx}
                src={img.image_url}
                alt="리뷰 이미지"
                className={`review-image-thumb ${spoilerHidden ? 'blurred' : ''}`}
                onClick={() => {
                  if (!spoilerHidden) {  // 블러된 이미지는 클릭 시 확대 안되도록
                    setModalImages(review.images.map(imgObj => imgObj.image_url));
                    setModalIndex(idx);
                    setModalImageUrl(img.image_url);
                  }
                }}
                style={{ cursor: spoilerHidden ? 'not-allowed' : 'zoom-in' }}
              />
            ))}
          </div>
        )}
        {isSpoiler ? (
          <div className="review-content spoiler">
            <span className="spoiler-label">스포일러 포함</span>
            {spoilerHidden ? (
              <button
                className="show-spoiler-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpoilerToggle(review.id);
                }}
              >
                내용 보기
              </button>
            ) : null}
            <span className={spoilerHidden ? 'blurred' : ''} style={{ marginLeft: '16px' }}>
              {review.comment}
            </span>
          </div>
        ) : (
          <div className="review-content">{review.comment}</div>
        )}
        {isOwner && (
          <div className="review-actions">
            {editReviewId === review.id ? (
              <form onSubmit={handleEditSubmit} className="review-form" encType="multipart/form-data">
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
                {/* 기존 이미지 미리보기 및 삭제 */}
                {review.images && review.images.length > 0 && (
                  <div className="review-edit-images" style={{ margin: "10px 0" }}>
                    {review.images.map((img) => (
                      <div key={img.id} style={{ display: 'inline-block', position: 'relative', marginRight: 8 }}>
                        <img src={img.image_url} alt="리뷰 이미지" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(img.id, review.id)}
                          style={{
                            position: 'absolute', top: 0, right: 0, background: '#e74c3c', color: '#fff',
                            border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 14, cursor: 'pointer',
                            lineHeight: '22px', textAlign: 'center', padding: 0,
                          }}
                          title="이미지 삭제"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* 새 이미지 추가/취소 */}
                <div className="review-form-group">
                  <label htmlFor="edit-review-image">이미지 추가 (Ctrl/Shift로 여러 장 선택 가능)</label>
                  <input
                    id="edit-review-image"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      if (files.length > 5) {
                        setToastMsg('이미지는 최대 5장까지만 첨부할 수 있습니다.');
                        return;
                      }
                      setEditReviewData({ ...editReviewData, images: files });
                    }}
                  />
                  {editReviewData.images && editReviewData.images.length > 0 && (
                    <div style={{ marginTop: '7px' }}>
                      {editReviewData.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(img)}
                          alt="첨부 이미지 미리보기"
                          style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', marginRight: 7 }}
                        />
                      ))}
                      <button
                        type="button"
                        style={{ marginLeft: 8, color: '#e74c3c', background: '#222', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                        onClick={() => setEditReviewData({ ...editReviewData, images: [] })}
                      >
                        선택 취소
                      </button>
                    </div>
                  )}
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
    .map((id) =>
      (Array.isArray(ottList) ? ottList : []).find((ott) => ott.id === id)
    )
    .filter(Boolean);

  return (
    <div className="movie-detail-container">
      <Toast ref={toastRef} message={toastMsg} />
      {/* 영화 상세 정보 */}
      <div className="movie-info-section">
        <img src={movie.thumbnail_url} alt={movie.title} className="movie-thumbnail" />
        <div className="movie-text-info">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-average-rating">
            {renderAverageStars(movie.average_rating)}
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
            {movieOttList.map((ott) =>
              ott.link_url ? (
                <a
                  key={ott.id}
                  href={ott.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ott-link ott-row"
                  title={ott.name}
                >
                  <img src={ott.logo_url} alt={ott.name} className="ott-logo" />
                  <span className="ott-name">{ott.name}</span>
                </a>
              ) : (
                <span key={ott.id} className="ott-link-disabled ott-row" title="링크 없음">
                  <img src={ott.logo_url} alt={ott.name} className="ott-logo" style={{ opacity: 0.5 }} />
                  <span className="ott-name">{ott.name}</span>
                </span>
              )
            )}
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
              disabled={!getCurrentUser()}
              placeholder={getCurrentUser() ? '리뷰를 작성해주세요!' : '로그인 후 리뷰를 작성할 수 있습니다.'}
              rows={6}
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
            <label htmlFor="review-image">이미지 첨부 (Ctrl/Shift로 여러 장 선택 가능)</label>
            <input
              id="review-image"
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                const files = Array.from(e.target.files);
                if (files.length > 5) {
                  setToastMsg('이미지는 최대 5장까지만 첨부할 수 있습니다.');
                  return;
                }
                setNewReview({ ...newReview, images: files });
              }}
            />
            {/* 미리보기 + 취소 버튼 */}
            {newReview.images && newReview.images.length > 0 && (
              <div style={{ marginTop: '7px' }}>
                {newReview.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt="첨부 이미지 미리보기"
                    style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', marginRight: 7 }}
                  />
                ))}
                <button
                  type="button"
                  style={{ marginLeft: 8, color: '#e74c3c', background: '#222', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                  onClick={() => setNewReview({ ...newReview, images: [] })}
                >
                  선택 취소
                </button>
              </div>
            )}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성'}
          </button>
        </form>
      </section>

      {/* Top 리뷰 */}
      <section className="review-section">
        <h2>BEST 리뷰</h2>
        <div className="reviews">
          {getTopReviews().length === 0 ? (
            <p>BEST 리뷰가 없습니다.</p>
          ) : (
            getTopReviews().map((review) => renderReviewCard(review, true))
          )}
        </div>
      </section>

      {/* 전체 리뷰 */}
      <section className="review-section">
        <h2>전체 리뷰</h2>
        {/* 정렬 드롭다운 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 600, marginRight: 10 }}>정렬:</label>
          <select value={ordering} onChange={e => setOrdering(e.target.value)}>
            <option value="-created_at">최신순</option>
            <option value="created_at">오래된순</option>
            <option value="-like_count">추천순</option>
            <option value="rating">평점 낮은순</option>
            <option value="-rating">평점 높은순</option>
          </select>
        </div>

        {/* 리뷰 목록 */}
        <div className={`reviews ${reviewsLoading ? 'loading' : ''}`}>
          {reviews.length === 0 && !reviewsLoading ? (
            <p>첫 리뷰를 남겨주세요!</p>
          ) : (
            reviews.map((review) => renderReviewCard(review, false))
          )}

          {reviewsLoading && (
            <div className="review-spinner">
              <ClipLoader size={30} color="#e50914" />
            </div>
          )}
        </div>
      </section>

      {modalImageUrl && (
        <div className="image-modal" onClick={() => setModalImageUrl(null)}>
          {modalImages.length > 1 && (
            <>
              <button
                className="image-modal-arrow left"
                onClick={e => {
                  e.stopPropagation();
                  const newIdx = (modalIndex - 1 + modalImages.length) % modalImages.length;
                  setModalIndex(newIdx);
                  setModalImageUrl(modalImages[newIdx]);
                }}
              >◀</button>
              <button
                className="image-modal-arrow right"
                onClick={e => {
                  e.stopPropagation();
                  const newIdx = (modalIndex + 1) % modalImages.length;
                  setModalIndex(newIdx);
                  setModalImageUrl(modalImages[newIdx]);
                }}
              >▶</button>
            </>
          )}
          <img
            src={modalImageUrl}
            alt="확대 이미지"
            className="image-modal-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="image-modal-close"
            onClick={() => setModalImageUrl(null)}
            aria-label="닫기"
          >×</button>
        </div>
      )}

    </div>
  );
};

export default MovieDetailPage;