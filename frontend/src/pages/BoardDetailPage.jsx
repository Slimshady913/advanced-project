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

  // --- 상태
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const token = localStorage.getItem('access');
  const username = localStorage.getItem('username');

  // 카테고리 목록 로딩
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data) ? res.data
        : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  // 게시글 상세/댓글 로딩
  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  // 같은 카테고리 최신글(10개) 불러오기
  useEffect(() => {
    if (!post) return;
    // BoardListPage에서와 동일하게 slug 사용
    let categorySlug = post.category_slug || post.category || post.category_name || 'free';
    fetchRelatedPosts(categorySlug);
  }, [post]);

  // BoardListPage와 동일한 관련글 불러오기
  const fetchRelatedPosts = async (categorySlug) => {
    let url = `/board/posts/?category=${categorySlug}&page=1&page_size=10`;
    try {
      const res = await axios.get(url);
      // results가 있으면 results, 없으면 전체 배열에서 자기자신 제외
      let list = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : [];
      setRelatedPosts(list.filter(p => p.id !== Number(id)));
    } catch (err) {
      setRelatedPosts([]);
    }
  };

  const fetchPost = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
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

  // 카테고리 탭 (BoardListPage와 동일)
  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];
  const categorySlug = post?.category_slug || post?.category || 'free';

  // 탭 클릭
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 관련글 카드 클릭
  const handleRelatedPostClick = postId => {
    navigate(`/community/${categorySlug}/${postId}`);
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

  // 댓글 관련
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

  // 타이틀바 UI - BoardListPage 카드와 통일
  function TitleBar() {
    if (!post) return null;
    return (
      <div
        className="post-card pro"
        style={{
          background: '#222b38',
          borderRadius: 14,
          margin: '16px 0 18px 0',
          cursor: 'default',
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)'
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
        <div className="post-title-row" style={{alignItems:'center'}}>
          <span className="post-category" style={{
            fontWeight:900,
            fontSize:'1.05rem',
            padding:'5px 13px',
            background:'#2881e2',
            color:'#fff',
            borderRadius:'8px',
            marginRight:10
          }}>
            {post.category_name || post.category}
          </span>
          <h3 className="post-title" style={{
            fontWeight:900,
            fontSize:'1.19rem',
            color:'#fff',
            marginRight:12,
            marginBottom:0,
            whiteSpace:'normal',
            letterSpacing:'-0.5px'
          }}>{post.title}</h3>
        </div>
        <div className="post-meta-row" style={{flexDirection:'row', gap:12, marginLeft:2, alignItems:'center', marginBottom:6}}>
          <span className="post-user" style={{fontWeight:600, color:'#7cc6ff'}}>{post.user?.username || post.user}</span>
          <span className="post-date">{formatDate(post.created_at)}</span>
        </div>
        <div className="post-stats-row" style={{gap:13, marginLeft:2}}>
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
            {/* 타이틀 */}
            <TitleBar />
            {post && (
              <>
                {/* 본문 */}
                <div className={styles.content} style={{marginTop:6, marginBottom:24}}>
                  {post.content}
                </div>
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
                {/* 최신글 미리보기 */}
                <div style={{ marginTop: 48 }}>
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