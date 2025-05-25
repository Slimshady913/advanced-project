import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from './BoardDetailPage.module.css'; // 기존 CSS 모듈 그대로 사용!
import { formatDate } from '../utils/formatDate';

/**
 * BoardDetailPage - 게시글 상세 + 광고(좌우) + 통일된 레이아웃
 */
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
      setError('');
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
    <div className="board-root-layout">
      <div className="board-center-wrap">
        {/* 왼쪽 광고 */}
        <aside className="ad-left">
          <div className="ad-fixed">
            <div className="ad-banner">광고1</div>
            <div className="ad-banner short">광고2</div>
            <div className="ad-banner short">
              <img src="/ads/ad_test_left.png" alt="광고" style={{ width: '100%', borderRadius: 8 }} />
            </div>
          </div>
        </aside>
        {/* 중앙 본문 */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <div className={styles.detailContainer}>
            {post && (
              <>
                <div className={styles.postHeader}>
                  <div className={styles.postMeta}>
                    <span className={styles.category}>{post.category || '카테고리'}</span>
                    <span className={styles.date}>{formatDate(post.created_at)}</span>
                    <span className={styles.views}>조회 {post.views || post.view_count || 0}</span>
                    <span className={styles.comments}>댓글 {comments.length}</span>
                  </div>
                  <h1 className={styles.postTitle}>{post.title}</h1>
                  <div className={styles.postAuthor}>
                    <span className={styles.avatar}>{post.user?.[0] || '👤'}</span>
                    <span className={styles.authorName}>{post.user}</span>
                  </div>
                </div>
                {post.attachment && (
                  <div className={styles.postAttachment}>
                    <a href={post.attachment} download>
                      {post.attachment.split('/').pop()}
                    </a>
                  </div>
                )}
                <div className={styles.content}>{post.content}</div>
                <div className={styles.postLikeActions}>
                  <button
                    className={`${styles.likeBtn}${post.my_like === true ? ` ${styles.active}` : ''}`}
                    onClick={() => handlePostLike(true)}
                    disabled={likeLoading || !token}
                  >
                    추천 {post.like_count}
                  </button>
                  <button
                    className={`${styles.dislikeBtn}${post.my_like === false ? ` ${styles.active}` : ''}`}
                    onClick={() => handlePostLike(false)}
                    disabled={likeLoading || !token}
                  >
                    비추천
                  </button>
                </div>
                {username === post.user && token && (
                  <div className={styles.postActions}>
                    <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
                    <button onClick={handlePostDelete}>삭제</button>
                  </div>
                )}
                <h3 className={styles.commentTitle}>댓글 {comments.length}</h3>
                {token ? (
                  <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요"
                    ></textarea>
                    <button type="submit">댓글 작성</button>
                  </form>
                ) : (
                  <p className={styles.loginMessage}>댓글 작성은 로그인 후 이용하실 수 있습니다.</p>
                )}
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.commentList}>
                  {comments.map((comment) => {
                    const isTop = topCommentIds.includes(comment.id);
                    return (
                      <div
                        key={comment.id}
                        className={`${styles.commentItem}${isTop ? ` ${styles.best}` : ''}`}
                      >
                        <div className={styles.commentHead}>
                          {isTop && <span className={styles.bestBadge}>BEST</span>}
                          <span className={styles.commentUser}>{comment.user}</span>
                          <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
                        </div>
                        <div className={styles.commentBody}>{comment.content}</div>
                        <div className={styles.commentActions}>
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
        </main>
        {/* 오른쪽 광고 */}
        <aside className="ad-right">
          <div className="ad-fixed">
            <div className="ad-banner">광고A</div>
            <div className="ad-banner short">광고B</div>
            <div className="ad-banner short">
              <img src="/ads/ad_test_right.png" alt="광고" style={{ width: '100%', borderRadius: 8 }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BoardDetailPage;