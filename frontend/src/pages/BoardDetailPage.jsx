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
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setComments([]);
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
      await fetchPost();
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

  // 추천 상위 3개의 댓글을 주요댓글로 지정
  const topCommentIds = comments
    .slice()
    .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 3)
    .map((c) => c.id);

  return (
    <div className="detail-container">
      {post && (
        <>
          <div className="post-header">
            <div className="post-meta">
              <span className="category">{post.category || '카테고리'}</span>
              <span className="date">{formatDate(post.created_at)}</span>
              <span className="views">조회 {post.views || post.view_count || 0}</span>
              <span className="comments">댓글 {comments.length}</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-author">
              <span className="avatar">{post.user?.[0] || '👤'}</span>
              <span className="author-name">{post.user}</span>
            </div>
          </div>
          {post.attachment && (
            <div className="post-attachment">
              <a href={post.attachment} download>
                {post.attachment.split('/').pop()}
              </a>
            </div>
          )}
          <div className="content">{post.content}</div>
          <div className="post-like-actions">
            <button
              className={`like-btn${post.my_like === true ? ' active' : ''}`}
              onClick={() => handlePostLike(true)}
              disabled={likeLoading || !token}
            >
              추천 {post.like_count}
            </button>
            <button
              className={`dislike-btn${post.my_like === false ? ' active' : ''}`}
              onClick={() => handlePostLike(false)}
              disabled={likeLoading || !token}
            >
              비추천
            </button>
          </div>
          {username === post.user && token && (
            <div className="post-actions">
              <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
              <button onClick={handlePostDelete}>삭제</button>
            </div>
          )}
          <h3>댓글 {comments.length}</h3>
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
            <p className="login-message">댓글 작성은 로그인 후 이용하실 수 있습니다.</p>
          )}
          {error && <p className="error-message">{error}</p>}
          <div className="comment-list">
            {comments.map((comment) => {
              const isTop = topCommentIds.includes(comment.id);
              return (
                <div
                  key={comment.id}
                  className={`comment-item${isTop ? ' best' : ''}`}
                >
                  <div className="comment-head">
                    {isTop && <span className="best-badge">BEST</span>}
                    <span className="comment-user">{comment.user}</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                  <div className="comment-body">{comment.content}</div>
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default BoardDetailPage;