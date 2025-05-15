import React from 'react';

/**
 * 리뷰 댓글 컴포넌트
 * @param {Object} props - 댓글 데이터 및 핸들러들
 */
const CommentSection = ({
  reviewId,
  comments,
  commentValue,
  onChange,
  onSubmit,
  onDelete,
  isLoggedIn
}) => {
  return (
    <div className="review-comments">
      <h4>💬 댓글</h4>
      {comments?.map((comment) => (
        <div key={comment.id} className="comment">
          <span><strong>{comment.user}:</strong> {comment.content}</span>
          {comment.is_owner && (
            <button onClick={() => onDelete(comment.id)}>삭제</button>
          )}
        </div>
      ))}
      {isLoggedIn && (
        <div className="comment-form">
          <textarea
            placeholder="댓글을 입력하세요"
            value={commentValue}
            onChange={(e) => onChange(reviewId, e.target.value)}
          />
          <button onClick={() => onSubmit(reviewId)}>댓글 작성</button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;