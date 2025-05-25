import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './BoardDetailPage.css';
import { formatDate } from '../utils/formatDate';

function BoardDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('access');
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchPost();
    fetchComments();
    // eslint-disable-next-line
  }, [id]);

  const fetchPost = async () => {
    try {
      // 토큰이 있으면 Authorization 헤더 추가, 없으면 명시적으로 빈 헤더 설정
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };
      const res = await axios.get(`/board/posts/${id}/`, config);
      setPost(res.data);
    } catch (err) {
      console.error('게시글 조회 실패', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/comments/`);
      // 배열이 아니면 빈 배열로 강제 변환 (방어코드)
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setComments([]); // 실패시에도 빈 배열
      console.error('댓글 목록 불러오기 실패', err);
    }
  };

  const handlePostLike = async (isLike) => {
    if (!token) return;
    setLikeLoading(true);
    try {
      await axios.post(
        `/board/posts/${id}/like/`,
        { is_like: isLike },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchPost(); // 추천수, 상태 즉시 반영
    } catch (err) {
      alert('추천/비추천 처리 중 오류가 발생했습니다.');
    }
    setLikeLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('댓글을 입력하세요.');
      return;
    }

    try {
      await axios.post(
        `/board/posts/${id}/comments/`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('댓글 작성 실패', err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`/board/comments/${commentId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchComments();
    } catch (err) {
      console.error('댓글 삭제 실패', err);
    }
  };

  const handleCommentLike = async (commentId, isLike) => {
    try {
      await axios.post(
        `/board/comments/${commentId}/like/`,
        { is_like: isLike },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchComments();
    } catch (err) {
      console.error('댓글 추천 실패', err);
    }
  };

  const handlePostDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/board/posts/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate('/community');
      } catch (err) {
        console.error('게시글 삭제 실패', err);
      }
    }
  };

  return (
    <div className="detail-container">
      {post && (
        <>
          <h2>{post.title}</h2>
          <p className="meta">
            작성자: {post.user} | {formatDate(post.created_at)}
          </p>
          <p className="content">{post.content}</p>

          {/* 좋아요/비추천 버튼 */}
          <div className="post-like-actions" style={{ margin: '10px 0 20px 0' }}>
            <button
              className={`like-btn${post.my_like === true ? ' active' : ''}`}
              onClick={() => handlePostLike(true)}
              disabled={likeLoading || !token}
              style={{
                marginRight: '10px',
                background: post.my_like === true ? '#00aeef' : '#e0e0e0',
                color: post.my_like === true ? '#fff' : '#222',
                borderRadius: '8px',
                fontWeight: 'bold',
                padding: '7px 14px',
                border: 'none',
                cursor: token ? 'pointer' : 'not-allowed'
              }}
            >
              👍 추천 {post.like_count}
            </button>
            <button
              className={`dislike-btn${post.my_like === false ? ' active' : ''}`}
              onClick={() => handlePostLike(false)}
              disabled={likeLoading || !token}
              style={{
                background: post.my_like === false ? '#d30000' : '#e0e0e0',
                color: post.my_like === false ? '#fff' : '#222',
                borderRadius: '8px',
                fontWeight: 'bold',
                padding: '7px 14px',
                border: 'none',
                cursor: token ? 'pointer' : 'not-allowed'
              }}
            >
              👎 비추천
            </button>
          </div>

          {username === post.user && token && (
            <div className="post-actions">
              <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
              <button onClick={handlePostDelete}>삭제</button>
            </div>
          )}

          <h3>댓글</h3>
          {token ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
              ></textarea>
              <button type="submit">댓글 작성</button>
            </form>
          ) : (
            <p style={{ color: '#aaa', margin: '1rem 0 2rem 0' }}>댓글 작성은 로그인 후 이용하실 수 있습니다.</p>
          )}
          {error && <p className="error-message">{error}</p>}

          <div className="comment-list">
            {(Array.isArray(comments) ? comments : []).map((comment) => (
              <div key={comment.id} className="comment-item">
                <p>
                  {comment.user}: {comment.content}
                </p>
                <p className="comment-meta">{formatDate(comment.created_at)}</p>
                <div className="comment-actions">
                  <button
                    onClick={() => handleCommentLike(comment.id, true)}
                    disabled={!token}
                  >
                    👍 {comment.like_count ?? 0}
                  </button>
                  {comment.user === username && token && (
                    <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BoardDetailPage;