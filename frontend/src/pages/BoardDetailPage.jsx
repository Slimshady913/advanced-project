import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import styles from './BoardDetailPage.module.css';
import './BoardListPage.css'; // 전역 카테고리/카드 스타일 재활용
import { formatDate } from '../utils/formatDate';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye, FaImage } from 'react-icons/fa';

function BoardDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 카테고리, 상세, 댓글, 같은 카테고리 최신글 상태
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const token = localStorage.getItem('access');
  const username = localStorage.getItem('username');

  // 카테고리 목록 불러오기
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data) ? res.data
                : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  // 상세/댓글 불러오기
  useEffect(() => {
    fetchPost();
    fetchComments();
    // eslint-disable-next-line
  }, [id]);

  // 같은 카테고리 최신글 불러오기
  useEffect(() => {
    if (post && post.category_slug) {
      fetchRelatedPosts(post.category_slug);
    }
    // eslint-disable-next-line
  }, [post]);

  const fetchPost = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : { headers: {} };
      const res = await axios.get(`/board/posts/${id}/`, config);
      setPost(res.data);
    } catch (err) { setPost(null); }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/comments/`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setComments([]);
    }
  };

  const fetchRelatedPosts = async (categorySlug) => {
    try {
      // 10개 최신글, 자기자신 제외
      const res = await axios.get(`/board/posts/?category=${categorySlug}&page=1&page_size=11`);
      if (res.data && res.data.results) {
        setRelatedPosts(res.data.results.filter(p => p.id !== Number(id)).slice(0, 10));
      }
    } catch (err) {
      setRelatedPosts([]);
    }
  };

  // 카테고리 탭 클릭 시 이동
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 상세 하단 게시글 카드 클릭
  const handleRelatedPostClick = postId => {
    navigate(`/community/${post?.category_slug || post?.category || 'free'}/${postId}`);
  };

  // 추천 상위 3개 댓글
  const topCommentIds = comments
    .slice().sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 3).map(c => c.id);

  // 카테고리 탭 목록 생성
  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];
  // 현재 게시글의 카테고리
  const categorySlug = post?.category_slug || post?.category || 'free';

  // 추천/비추천
  const handlePostLike = async (isLike) => {
    if (!token) return;
    setLikeLoading(true);
    try {
      await axios.post(`/board/posts/${id}/like/`, { is_like: isLike },
        { headers: { Authorization: `Bearer ${token}` } });
      await fetchPost();
    } catch (err) { /* 에러처리 */ }
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
    } catch (err) { /* 에러처리 */ }
  };
  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`/board/comments/${commentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) { /* 에러처리 */ }
  };
  const handleCommentLike = async (commentId, isLike) => {
    try {
      await axios.post(
        `/board/comments/${commentId}/like/`,
        { is_like: isLike },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) { /* 에러처리 */ }
  };
  const handlePostDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/board/posts/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/community');
      } catch (err) { /* 에러처리 */ }
    }
  };

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
        {/* 본문 */}
        <main className="board-center">
          <div className="board-container pro" style={{marginTop:38}}>
            {/* 카테고리 탭 */}
            <div className="category-tabs pro">
              {customTabs.map(cat => (
                <button
                  key={cat.slug}
                  className={categorySlug === cat.slug ? 'active' : ''}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {post && (
              <>
                {/* 게시글 카드 스타일 */}
                <div
                  className="post-card pro"
                  style={{
                    background: 'none',
                    cursor: 'default',
                    borderRadius: 14,
                    marginTop: '10px',
                    marginBottom: '22px'
                  }}
                >
                  <div className="post-thumb">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt="썸네일"
                        className="post-thumb-img"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="post-thumb-icon"><FaImage /></div>
                    )}
                  </div>
                  <div className="post-title-row">
                    <span className="post-category">[{post.category_name || post.category}]</span>
                    <h3 className="post-title" style={{ whiteSpace: 'normal', fontWeight: 900, fontSize: '1.17rem' }}>
                      {post.title}
                    </h3>
                  </div>
                  <div className="post-meta-row">
                    <span className="post-user">{post.user?.username || post.user}</span>
                    <span className="post-date">{formatDate(post.created_at)}</span>
                  </div>
                  <div className="post-stats-row">
                    <span className="stat">
                      <FaThumbsUp className="icon like" /> {post.like_count}
                    </span>
                    <span className="stat">
                      <FaThumbsDown className="icon dislike" /> {post.dislike_count}
                    </span>
                    <span className="stat">
                      <FaComment className="icon comment" /> {comments.length}
                    </span>
                    <span className="stat">
                      <FaEye className="icon view" /> {post.views || post.view_count || 0}
                    </span>
                  </div>
                </div>

                {/* 본문 내용 */}
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
                {/* ↓↓↓ 컨테이너 하단: 같은 카테고리의 게시글 미리보기(최대 10개, 카드디자인) ↓↓↓ */}
                <div style={{marginTop: 48}}>
                  <div style={{fontWeight:900, fontSize:'1.13rem', color:'#53a7ff', marginBottom:18, paddingLeft:42}}>
                    {post.category_name || post.category} 게시판의 최신글
                  </div>
                  <div className="post-list pro" style={{marginBottom: 8}}>
                    {relatedPosts.length === 0
                      ? <p className="no-post">관련 게시글이 없습니다.</p>
                      : relatedPosts.map(rp => (
                        <div
                          key={rp.id}
                          className="post-card pro"
                          onClick={() => handleRelatedPostClick(rp.id)}
                          style={{ cursor:'pointer', borderRadius:12, background: 'none'}}
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