// MovieDetailPage.jsx - 전문가 스타일 적용 및 반응형 대응 포함
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import './MovieDetailPage.css';
import { ClipLoader } from 'react-spinners';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '' });
  const [newComment, setNewComment] = useState({});
  const token = localStorage.getItem('access');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(
        `/reviews/`,
        {
          movie: id,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview({ rating: 5, comment: '' });
      fetchMovieDetail();
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
    }
    setIsSubmitting(false);
  };

  const handleLike = async (reviewId) => {
    if (!token) return alert('로그인이 필요합니다.');
    try {
      await axios.post(`/reviews/${reviewId}/like/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMovieDetail();
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/reviews/${reviewId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMovieDetail();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const startEditing = (review) => {
    setEditReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment });
  };

  const cancelEditing = () => {
    setEditReviewId(null);
    setEditReviewData({ rating: 5, comment: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/reviews/${editReviewId}/`,
        {
          rating: editReviewData.rating,
          comment: editReviewData.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cancelEditing();
      fetchMovieDetail();
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  const handleCommentChange = (reviewId, value) => {
    setNewComment({ ...newComment, [reviewId]: value });
  };

  const handleCommentSubmit = async (reviewId) => {
    if (!newComment[reviewId]?.trim()) return;
    try {
      await axios.post(
        `/reviews/${reviewId}/comments/`,
        { content: newComment[reviewId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment({ ...newComment, [reviewId]: '' });
      fetchMovieDetail();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/reviews/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMovieDetail();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
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

  const top3Reviews = [...(movie.reviews || [])]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 3);

  const otherReviews = (movie.reviews || []).filter(
    (review) => !top3Reviews.find((top) => top.id === review.id)
  );

  const renderReviewCard = (review, isTop = false) => {
    const isEditing = editReviewId === review.id;
    const cardClass = `review-card${isTop ? ' top-review' : ''}`;

    return (
      <div key={review.id} className={cardClass}>
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="review-form">
            <div className="review-form-group review-form-group-horizontal">
              <label htmlFor="edit-rating">평점</label>
              <select
                id="edit-rating"
                value={editReviewData.rating}
                onChange={(e) =>
                  setEditReviewData({ ...editReviewData, rating: e.target.value })
                }
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="review-form-group">
              <label htmlFor="edit-comment">코멘트</label>
              <textarea
                id="edit-comment"
                value={editReviewData.comment}
                onChange={(e) =>
                  setEditReviewData({ ...editReviewData, comment: e.target.value })
                }
              />
            </div>
            <div className="review-actions">
              <button type="submit">저장</button>
              <button type="button" onClick={cancelEditing}>취소</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>작성자:</strong> {review.user}</p>
            <p><strong>평점:</strong> {review.rating} / 5</p>
            <p>
              <strong>내용:</strong> {review.comment}
              {review.is_edited && <span className="edited-label"> (수정됨)</span>}
            </p>
            <button onClick={() => handleLike(review.id)}>추천 {review.like_count}</button>
            {review.is_owner && (
              <div className="review-actions">
                <button onClick={() => startEditing(review)}>수정</button>
                <button onClick={() => handleDelete(review.id)}>삭제</button>
              </div>
            )}
            <div className="review-comments">
              <h4>댓글</h4>
              {review.comments?.map((comment) => (
                <div key={comment.id} className="comment">
                  <span><strong>{comment.user}:</strong> {comment.content}</span>
                  {comment.is_owner && (
                    <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                  )}
                </div>
              ))}
              {token && (
                <div className="comment-form">
                  <textarea
                    placeholder="댓글을 입력하세요"
                    value={newComment[review.id] || ''}
                    onChange={(e) => handleCommentChange(review.id, e.target.value)}
                  />
                  <button onClick={() => handleCommentSubmit(review.id)}>댓글 작성</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="movie-detail-container">
      <div className="movie-info-section">
        <img src={movie.thumbnail_url} alt={movie.title} className="movie-thumbnail" />
        <div className="movie-text-info">
          <h1 className="movie-title">{movie.title}</h1>
          <p className="movie-description">{movie.description}</p>
          <div className="ott-logos">
            {movie.ott_list?.map((ott) => (
              <img key={ott.id} src={ott.logo_url} alt={ott.name} className="ott-logo" />
            ))}
          </div>
        </div>
      </div>

      <section className="review-section">
        <h2>리뷰 작성</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="review-form-group review-form-group-horizontal">
            <label htmlFor="rating">평점</label>
            <select
              id="rating"
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="review-form-group">
            <label htmlFor="comment">코멘트</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성'}
          </button>
        </form>
      </section>

      <section className="review-section">
        <h2>Top 리뷰</h2>
        <div className="reviews">
          {top3Reviews.length === 0 ? (
            <p>아직 추천된 리뷰가 없습니다.</p>
          ) : (
            top3Reviews.map((review) => renderReviewCard(review, true))
          )}
        </div>
      </section>

      <section className="review-section">
        <h2>전체 리뷰</h2>
        <div className="reviews">
          {otherReviews.length === 0 ? (
            <p>다른 리뷰가 없습니다.</p>
          ) : (
            otherReviews.map((review) => renderReviewCard(review))
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetailPage;