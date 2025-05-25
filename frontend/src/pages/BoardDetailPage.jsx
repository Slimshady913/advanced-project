import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from './BoardDetailPage.module.css';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye, FaImage } from 'react-icons/fa';

function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const token = localStorage.getItem('access');
  const username = localStorage.getItem('username');

  // 카테고리 목록
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data) ? res.data
        : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  // 상세/댓글
  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  // 같은 카테고리 최신글
  useEffect(() => {
    if (post) {
      const slug =
        post.category_slug || post.category || post.category_name || (categories[0] && categories[0].slug) || 'free';
      fetchRelatedPosts(slug);
    }
    // eslint-disable-next-line
  }, [post, categories]);

  const fetchPost = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : { headers: {} };
      const res = await axios.get(`/board/posts/${id}/`, config);
      setPost(res.data);
    } catch (err) {
      setPost(null);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/comments/`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setComments([]);
    }
  };

  // 최신글 10개 불러오기 (자기자신 제외)
  const fetchRelatedPosts = async (categorySlug) => {
    if (!categorySlug) return setRelatedPosts([]);
    try {
      const res = await axios.get(`/board/posts/?category=${categorySlug}&page=1&page_size=11`);
      const arr = res.data?.results ?? res.data ?? [];
      setRelatedPosts(arr.filter(p => p.id !== Number(id)).slice(0, 10));
    } catch (err) {
      setRelatedPosts([]);
    }
  };

  // 카테고리 탭
  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];

  // 탭 클릭
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 상세 하단 게시글 카드 클릭
  const handleRelatedPostClick = postId => {
    if (!post) return;
    const slug = post.category_slug || post.category || 'free';
    navigate(`/community/${slug}/${postId}`);
  };

  // 댓글 상위 3개
  const topCommentIds = comments
    .slice().sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 3).map(c => c.id);

  // 추천/비추천
  const handlePostLike = async (isLike) => {
    if (!token) return;
    setLikeLoading(true);
    try {
      await axios.post(`/board/posts/${id}/like/`, { is_like: isLike },
        { headers: { Authorization: `Bearer ${token}` } });
      await fetchPost();
    } catch (err) { }
    setLikeLoading(false);
  };

  // 댓글
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) { setError('댓글을 입력하세요.'); return; }
    try {
      await axios.post(
        `/board/posts/${id}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment(''); setError(''); fetchComments();
    } catch (err) { }
  };
  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`/board/comments/${commentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) { }
  };
  const handleCommentLike = async (commentId, isLike) => {
    try {
      await axios.post(
        `/board/comments/${commentId}/like/`,
        { is_like: isLike },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) { }
  };
  const handlePostDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/board/posts/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/community');
      } catch (err) { }
    }
  };

  // 타이틀 줄(카테고리/제목/작성자/날짜/통계)
  function TitleBar() {
    if (!post) return null;
    return (
      <div style={{
        background: '#232c38',
        borderRadius: 12,
        padding: '18px 42px 16px 42px',
        marginBottom: 19,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 10px rgba(0,30,90,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            background: '#2981d4',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.02rem',
            padding: '4px 17px',
            borderRadius: 12,
            marginRight: 14,
            letterSpacing: '-0.5px',
            display: 'inline-block'
          }}>
            {post.category_name || post.category}
          </span>
          <span style={{
            fontWeight: 800,
            fontSize: '1.17rem',
            color: '#e5f0ff',
            marginRight: 11,
            lineHeight: 1.3
          }}>{post.title}</span>
          <span style={{
            marginLeft: 'auto',
            color: '#7ca2c8',
            fontSize: '0.97rem',
            fontWeight: 500
          }}>{formatDate(post.created_at)}</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 1,
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontWeight: 700,
            color: '#90c7fa',
            fontSize: '1.01rem'
          }}>{post.user?.username || post.user}</span>
          <span style={{ color: '#b6bfd2', fontWeight: 500, display: 'flex', gap: 12, fontSize: '1.06rem' }}>
            <span><FaThumbsUp className="icon like" /> {post.like_count}</span>
            <span><FaThumbsDown className="icon dislike" /> {post.dislike_count}</span>
            <span><FaComment className="icon comment" /> {comments.length}</span>
            <span><FaEye className="icon view" /> {post.views || post.view_count || 0}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="board-root-layout">
      <div className="board-center-wrap">
        {/* 광고 */}
        <aside className="ad-left">
          <div className="ad-fixed">
            <div className="ad-banner">광고1</div>
            <div className="ad-banner short">광고2</div>
            <div className="ad-banner short">
              <img src="/ads/ad_test_left.png" alt="광고" style={{ width: '100%', borderRadius: 8 }} />
            </div>
          </div>
        </aside>
        <main className="board-center">
          <div className="board-container pro" style={{ marginTop: 38 }}>
            {/* 카테고리 탭 */}
            <div className="category-tabs pro">
              {customTabs.map(cat => (
                <button
                  key={cat.slug}
                  className={post && (post.category_slug || post.category) === cat.slug ? 'active' : ''}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* 타이틀바 */}
            <TitleBar />
            {post && (
              <>
                {/* 본문 */}
                <div className={styles.content}>{post.content}</div>
                {/* 첨부파일 */}
                {post.attachment && (
                  <div className={styles.postAttachment}>
                    <a href={post.attachment} download>
                      {post.attachment.split('/').pop()}
                    </a>
                  </div>
                )}
                {/* 추천/비추천 */}
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
                {/* 수정/삭제 */}
                {username === (post.user?.username || post.user) && token && (
                  <div className={styles.postActions}>
                    <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
                    <button onClick={handlePostDelete}>삭제</button>
                  </div>
                )}
                {/* 댓글 */}
                <h3 className={styles.commentTitle}>댓글 {comments.length}</h3>
                {token ? (
                  <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요"
                    ></textarea>
                    <button type="submit">댓글 작성</button>
                  </form>
                ) : (
                  <p className={styles.loginMessage}>댓글 작성은 로그인 후 이용하실 수 있습니다.</p>
                )}
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.commentList}>
                  {comments.map(comment => {
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
                {/* 최신글 미리보기(10개) */}
                <div style={{ marginTop: 48 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.13rem', color: '#53a7ff', marginBottom: 18, paddingLeft: 42 }}>
                    {(post.category_name || post.category) + ' 게시판의 최신글'}
                  </div>
                  <div className="post-list pro" style={{ marginBottom: 8 }}>
                    {relatedPosts.length === 0
                      ? <p className="no-post">관련 게시글이 없습니다.</p>
                      : relatedPosts.map(rp => (
                        <div
                          key={rp.id}
                          className="post-card pro"
                          onClick={() => handleRelatedPostClick(rp.id)}
                          style={{ cursor: 'pointer', borderRadius: 12, background: 'none' }}
                        >
                          <div className="post-thumb">
                            {rp.thumbnail_url ? (
                              <img
                                src={rp.thumbnail_url}
                                alt="썸네일"
                                className="post-thumb-img"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="post-thumb-icon"><FaImage /></div>
                            )}
                          </div>
                          <div className="post-title-row">
                            <span className="post-category">[{rp.category_name}]</span>
                            <h3 className="post-title">{rp.title}</h3>
                          </div>
                          <div className="post-meta-row">
                            <span className="post-user">{rp.user?.username || rp.user}</span>
                            <span className="post-date">{formatDate(rp.created_at)}</span>
                          </div>
                          <div className="post-stats-row">
                            <span className="stat">
                              <FaThumbsUp className="icon like" /> {rp.like_count}
                            </span>
                            <span className="stat">
                              <FaThumbsDown className="icon dislike" /> {rp.dislike_count}
                            </span>
                            <span className="stat">
                              <FaComment className="icon comment" /> {rp.comment_count}
                            </span>
                            <span className="stat">
                              <FaEye className="icon view" /> {rp.view_count}
                            </span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
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