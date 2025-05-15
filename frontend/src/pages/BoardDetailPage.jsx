import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './BoardDetailPage.css';

function BoardDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  console.log('post:', post);
  console.log('comments:', comments);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/`);
      setPost(res.data);
    } catch (err) {
      console.error('게시글 조회 실패', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/comments/`);
      setComments(res.data);
    } catch (err) {
      console.error('댓글 목록 불러오기 실패', err);
    }
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
          <p className="meta">작성자: {post.user} | {post.created_at.slice(0, 10)}</p>
          <p className="content">{post.content}</p>

          {username === post.user && (
            <div className="post-actions">
              <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
              <button onClick={handlePostDelete}>삭제</button>
            </div>
          )}

          <h3>댓글</h3>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
            ></textarea>
            <button type="submit">댓글 작성</button>
          </form>
          {error && <p className="error-message">{error}</p>}

          <div className="comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <p>{comment.user}: {comment.content}</p>
                <p className="comment-meta">{comment.created_at.slice(0, 10)}</p>
                <div className="comment-actions">
                  <button onClick={() => handleCommentLike(comment.id, true)}>👍 {comment.like_count ?? 0}</button>
                  {comment.user === username && (
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