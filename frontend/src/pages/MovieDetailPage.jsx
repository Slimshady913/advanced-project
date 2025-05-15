import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import './MovieDetailPage.css';
import { ClipLoader } from 'react-spinners';

import MovieInfo from '../components/MovieInfo';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';

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
        { movie: id, rating: newReview.rating, comment: newReview.comment },
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
        editReviewData,
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
      <div className="loading-container">
        <ClipLoader size={60} color="#e50914" />
        <p>영화 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!movie) return <p>영화 정보를 찾을 수 없습니다.</p>;

  const top3Reviews = [...(movie.reviews || [])]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 3);

  const otherReviews = (movie.reviews || []).filter(
    (review) => !top3Reviews.find((top) => top.id === review.id)
  );

  return (
    <div className="movie-detail-container">
      {/* 🎬 영화 정보 - 반드시 최상단에 배치 */}
      <section className="movie-info-wrapper">
        <MovieInfo movie={movie} />
      </section>

      {/* 📝 리뷰 작성 */}
      <section className="review-write-wrapper">
        <h2>📝 리뷰 작성</h2>
        <ReviewForm
          reviewData={newReview}
          onChange={setNewReview}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </section>

      {/* 🎖️ Top 3 리뷰 */}
      <section>
        <h2>🎖️ Top 3 리뷰</h2>
        <div className="reviews">
          {top3Reviews.length === 0 ? (
            <p>아직 추천된 리뷰가 없습니다.</p>
          ) : (
            top3Reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isTop={true}
                isEditing={editReviewId === review.id}
                editReviewData={editReviewData}
                onEditChange={setEditReviewData}
                onEditSubmit={handleEditSubmit}
                onCancelEdit={cancelEditing}
                onEditStart={startEditing}
                onDelete={handleDelete}
                onLike={handleLike}
                token={token}
                commentState={newComment}
                onCommentChange={handleCommentChange}
                onCommentSubmit={handleCommentSubmit}
                onCommentDelete={handleCommentDelete}
              />
            ))
          )}
        </div>
      </section>

      {/* 📋 다른 리뷰 */}
      <section>
        <h2>📝 다른 리뷰</h2>
        <div className="reviews">
          {otherReviews.length === 0 ? (
            <p>다른 리뷰가 없습니다.</p>
          ) : (
            otherReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isEditing={editReviewId === review.id}
                editReviewData={editReviewData}
                onEditChange={setEditReviewData}
                onEditSubmit={handleEditSubmit}
                onCancelEdit={cancelEditing}
                onEditStart={startEditing}
                onDelete={handleDelete}
                onLike={handleLike}
                token={token}
                commentState={newComment}
                onCommentChange={handleCommentChange}
                onCommentSubmit={handleCommentSubmit}
                onCommentDelete={handleCommentDelete}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetailPage;