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

  // ❌ localStorage 토큰 참조 삭제
  // 로그인 여부, username 등은 상위(App)에서 props로 내려받는 게 권장이나,
  // 여기선 댓글/추천 등 '버튼 활성화'에서만 체크하면 됨.

  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data) ? res.data
        : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  useEffect(() => {
    fetchPost();
    fetchComments();
    // eslint-disable-next-line
  }, [id]);

  const getCategorySlug = () => {
    if (post?.category_slug) return post.category_slug;
    if (post?.category_name) {
      const cat = categories.find(c => c.name === post.category_name);
      if (cat) return cat.slug;
    }
    if (post?.category) {
      const cat = categories.find(c => c.name === post.category);
      if (cat) return cat.slug;
      if (categories.some(c => c.slug === post.category)) return post.category;
    }
    return 'free';
  };

  useEffect(() => {
    if (!post || categories.length === 0) return;
    let categorySlug = getCategorySlug();
    fetchRelatedPosts(categorySlug);
    // eslint-disable-next-line
  }, [post, categories]);

  const fetchRelatedPosts = async (categorySlug) => {
    let url = `/board/posts/?category=${categorySlug}&ordering=-created_at&page=1&page_size=10`;
    try {
      const res = await axios.get(url);
      let list = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : [];
      setRelatedPosts(list.filter(p => p.id !== Number(id)));
    } catch (err) {
      setRelatedPosts([]);
    }
  };

  const fetchPost = async () => {
    try {
      // ✅ headers 옵션 제거, 쿠키 인증 자동!
      const res = await axios.get(`/board/posts/${id}/`);
      setPost(res.data);
    } catch (err) {
      setPost(null);
    }
  };

  const fetchComments = async () => {
    try {
      // ✅ headers 옵션 제거, 쿠키 인증 자동!
      const res = await axios.get(`/board/posts/${id}/comments/`);
      if (Array.isArray(res.data.results)) {
        setComments(res.data.results); // pagination 구조 대응
      } else if (Array.isArray(res.data)) {
        setComments(res.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      setComments([]);
    }
  };

  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];
  const categorySlug = getCategorySlug();

  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  const handleRelatedPostClick = postId => {
    navigate(`/community/${categorySlug}/${postId}`);
  };

  const topCommentIds = comments
    .slice().sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 3).map(c => c.id);

  // ★ 로그인 체크(예시, props나 context 등으로 대체 가능)
  const isLoggedIn = !!localStorage.getItem('username');
  // 혹은 App 등에서 내려받는 username을 활용 가능
  // (아래 username 변수 예시)
  const username = localStorage.getItem('username');

  // ---------- 모든 인증 요청에서 headers 제거! ----------
  const handlePostLike = async (isLike) => {
    if (!isLoggedIn) return;
    setLikeLoading(true);
    try {
      await axios.post(`/board/posts/${id}/like/`, { is_like: isLike });
      await fetchPost();
    } catch (err) { }
    setLikeLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) { setError('댓글을 입력하세요.'); return; }
    try {
      await axios.post(`/board/posts/${id}/comments/`, { content: newComment });
      setNewComment(''); setError(''); fetchComments();
    } catch (err) { }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`/board/comments/${commentId}/`);
      fetchComments();
    } catch (err) { }
  };

  const handleCommentLike = async (commentId, isLike) => {
    try {
      await axios.post(`/board/comments/${commentId}/like/`, { is_like: isLike });
      fetchComments();
    } catch (err) { }
  };

  const handlePostDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/board/posts/${id}/`);
        navigate('/community');
      } catch (err) { }
    }
  };

  return (
    <div className="board-root-layout">
      <div className="board-center-wrap">
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
          <div className={styles.detailContainer}>
            {/* 카테고리 탭 */}
            <div className="category-tabs pro" style={{marginTop:28}}>
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

            {/* 상단 정보 */}
            {post && (
              <>
                <div className={styles.headerRow}>
                  <span className={styles.categoryTag}>{post.category_name || post.category}</span>
                  <div className={styles.titleText}>{post.title}</div>
                  <div className={styles.statsRow}>
                    <span className={styles.stat}><FaThumbsUp className="icon" />{post.like_count}</span>
                    <span className={styles.stat}><FaThumbsDown className="icon" />{post.dislike_count}</span>
                    <span className={styles.stat}><FaComment className="icon" />{post.comment_count}</span>
                    <span className={styles.stat}><FaEye className="icon" />{post.views || post.view_count || 0}</span>
                  </div>
                </div>
                <div className={styles.writerRow}>
                  <span className={styles.writerName}>{post.user?.username || post.user}</span>
                  <span className={styles.writeDate}>{formatDate(post.created_at)}</span>
                </div>

                {/* 본문 */}
                <div className={styles.content}>
                  {post.thumbnail_url && (
                    <div style={{marginBottom: "18px"}}>
                      <img
                        src={post.thumbnail_url}
                        alt="썸네일"
                        style={{maxWidth: "320px", width: "100%", borderRadius: "11px", display: "block"}}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  {post.content}
                </div>
                {/* 첨부파일 */}
                {post.attachment && (
                  <div className={styles.attachmentRow}>
                    <a
                      href={post.attachment}
                      download
                      className={styles.attachmentLink}
                    >
                      {post.attachment.split('/').pop()}
                    </a>
                  </div>
                )}

                {/* 추천/비추천 */}
                <div className={styles.postLikeActions}>
                  <button
                    className={`${styles.likeBtn}${post.my_like === true ? ` ${styles.active}` : ''}`}
                    onClick={() => handlePostLike(true)}
                    disabled={likeLoading || !isLoggedIn}
                  >
                    추천 {post.like_count}
                  </button>
                  <button
                    className={`${styles.dislikeBtn}${post.my_like === false ? ` ${styles.active}` : ''}`}
                    onClick={() => handlePostLike(false)}
                    disabled={likeLoading || !isLoggedIn}
                  >
                    비추천
                  </button>
                </div>

                {/* 수정/삭제 */}
                {/* username 확인은 상위 props나 context 활용 권장! */}
                {isLoggedIn && (
                  <div className={styles.postActions}>
                    <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
                    <button onClick={handlePostDelete}>삭제</button>
                  </div>
                )}

                {/* --------- 댓글영역 --------- */}
                <div className={styles.commentSection}>
                  <h3 className={styles.commentTitle}>댓글 {comments.length}</h3>
                  {isLoggedIn ? (
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
                              disabled={!isLoggedIn}
                            >
                              👍 {comment.like_count ?? 0}
                            </button>
                            {/* 댓글 삭제 버튼 활성화: 본인 여부 확인 (username 변수/props 활용 필요) */}
                            {isLoggedIn && (
                              <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 최신글 미리보기 */}
                <div style={{ marginTop: 46 }}>
                  <div style={{
                    fontWeight: 900, fontSize: '1.13rem', color: '#53a7ff',
                    marginBottom: 18, paddingLeft: 42
                  }}>
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