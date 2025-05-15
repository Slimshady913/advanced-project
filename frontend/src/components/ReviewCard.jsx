import React from 'react';
import CommentSection from './CommentSection';

/**
 * 리뷰 카드 컴포넌트
 * @param {Object} props - 리뷰 데이터 및 핸들러들
 */
const ReviewCard = ({
  review,
  isTop = false,
  isEditing,
  editReviewData,
  onEditChange,
  onEditSubmit,
  onCancelEdit,
  onLike,
  onDelete,
  onEditStart,
  commentState,
  onCommentChange,
  onCommentSubmit,
  onCommentDelete,
  token
}) => {
  const cardClass = `review-card${isTop ? ' top-review' : ''}`;

  return (
    <div className={cardClass}>
      {isEditing ? (
        <form onSubmit={onEditSubmit} className="review-form">
          <label>
            평점:
            <select
              value={editReviewData.rating}
              onChange={(e) => onEditChange({ ...editReviewData, rating: e.target.value })}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
          <label>
            코멘트:
            <textarea
              value={editReviewData.comment}
              onChange={(e) => onEditChange({ ...editReviewData, comment: e.target.value })}
            />
          </label>
          <button type="submit">저장</button>
          <button type="button" onClick={onCancelEdit}>취소</button>
        </form>
      ) : (
        <>
          <p><strong>작성자:</strong> {review.user}</p>
          <p><strong>평점:</strong> {review.rating} / 5</p>
          <p>
            <strong>내용:</strong> {review.comment}
            {review.is_edited && <span className="edited-label"> (수정됨)</span>}
          </p>
          <button onClick={() => onLike(review.id)}>👍 {review.like_count}</button>
          {review.is_owner && (
            <div className="review-actions">
              <button onClick={() => onEditStart(review)}>✏️ 수정</button>
              <button onClick={() => onDelete(review.id)}>🗑 삭제</button>
            </div>
          )}

          <CommentSection
            reviewId={review.id}
            comments={review.comments}
            commentValue={commentState[review.id] || ''}
            onChange={onCommentChange}
            onSubmit={onCommentSubmit}
            onDelete={onCommentDelete}
            isLoggedIn={!!token}
          />
        </>
      )}
    </div>
  );
};

export default ReviewCard;