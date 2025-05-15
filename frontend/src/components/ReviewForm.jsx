import React from 'react';

/**
 * 리뷰 작성 폼 컴포넌트
 * @param {Object} props - 작성 중인 리뷰 데이터 및 핸들러들
 */
const ReviewForm = ({ reviewData, onChange, onSubmit, isSubmitting }) => {
  return (
    <form onSubmit={onSubmit} className="review-form">
      <label>
        평점:
        <select
          value={reviewData.rating}
          onChange={(e) => onChange({ ...reviewData, rating: e.target.value })}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </label>
      <label>
        코멘트:
        <textarea
          value={reviewData.comment}
          onChange={(e) => onChange({ ...reviewData, comment: e.target.value })}
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '작성 중...' : '리뷰 작성'}
      </button>
    </form>
  );
};

export default ReviewForm;