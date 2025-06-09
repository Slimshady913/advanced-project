import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from './BoardDetailPage.module.css';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye } from 'react-icons/fa';

function BoardDetailPage({ isLoggedIn, username }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 변수 정의
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  // 카테고리 목록 불러오기 (최초 1회)
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  // 게시글, 댓글, 조회수 증가 요청 (게시글 ID 변경 시)
  useEffect(() => {
    fetchPost();
    fetchComments();
    incrementView();
    // eslint-disable-next-line
  }, [id]);

  // 조회수 증가 요청
  const incrementView = async () => {
    try {
      await axios.post(`/board/posts/${id}/increment-view/`);
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  };

  // 게시글의 카테고리 슬러그를 유추
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

  // 관련 게시글 불러오기 (post 또는 카테고리 변경 시)
  useEffect(() => {
    if (!post || categories.length === 0) return;
    let categorySlug = getCategorySlug();
    fetchRelatedPosts(categorySlug);
    // eslint-disable-next-line
  }, [post, categories]);

  // 관련 게시글 API 호출
  const fetchRelatedPosts = async (categorySlug) => {
    let url = `/board/posts/?category=${categorySlug}&ordering=-created_at&page=1&page_size=10`;
    try {
      const res = await axios.get(url);
      let list = Array.isArray(res.data?.results)
        ? res.data.results
        : (Array.isArray(res.data) ? res.data : []);
      setRelatedPosts(list.filter(p => p.id !== Number(id)));
    } catch {
      setRelatedPosts([]);
    }
  };

  // 게시글 상세 데이터 불러오기
  const fetchPost = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/`);
      setPost(res.data);
    } catch {
      setPost(null);
    }
  };

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/comments/`);
      if (Array.isArray(res.data.results)) {
        setComments(res.data.results);
      } else if (Array.isArray(res.data)) {
        setComments(res.data);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    }
  };

  // 상단 카테고리 탭 구성
  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];
  const categorySlug = getCategorySlug();

  // 카테고리 클릭 시 이동
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 관련 게시글 클릭 시 이동
  const handleRelatedPostClick = postId => {
    navigate(`/community/${categorySlug}/${postId}`);
  };

  // BEST 댓글: 상위 3개 중 추천수 10 이상
  const bestCommentIds = comments
    .filter((comment, idx) => idx < 3 && (comment.like_count ?? 0) >= 10)
    .map(c => c.id);

  // 게시글 추천/비추천
  const handlePostLike = async (isLike) => {
    if (!isLoggedIn) return;
    setLikeLoading(true);
    try {
      await axios.post(`/board/posts/${id}/like/`, { is_like: isLike });
      await fetchPost();
    } catch {}
    setLikeLoading(false);
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('댓글을 입력하세요.');
      return;
    }
    try {
      await axios.post(`/board/posts/${id}/comments/`, { content: newComment });
      setNewComment('');
      setError('');
      fetchComments();
      fetchPost();
    } catch {}
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`/board/comments/${commentId}/`);
      fetchComments();
    } catch {}
  };

  // 댓글 추천/비추천
  const handleCommentLike = async (commentId, isLike) => {
    try {
      await axios.post(`/board/comments/${commentId}/like/`, { is_like: isLike });
      fetchComments();
    } catch {}
  };

  // 게시글 삭제
  const handlePostDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/board/posts/${id}/`);
        navigate('/community');
      } catch {}
    }
  };

  return (
    <div className="board-root-layout">
      <div className="board-center-wrap">
        {/* 좌측 광고 영역 */}
        <aside className="ad-left">
          <div className="ad-fixed">
            <div className="ad-banner">광고1</div>
            <div className="ad-banner short">광고2</div>
            <div className="ad-banner short">
              <img src="/ads/ad_test_left.png" alt="광고" style={{ width: '100%', borderRadius: 8 }} />
            </div>
          </div>
        </aside>

        {/* 본문 영역 */}
        <main className="board-center">
          <div className={styles.detailContainer}>
            
            {/* 카테고리 탭 영역 */}
            <div className="category-tabs pro" style={{ marginTop: 28 }}>
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
                {/* 게시글 제목 및 통계 */}
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

                {/* 작성자 및 작성일 */}
                <div className={styles.writerRow}>
                  <span className={styles.writerName}>{post.user?.username || post.user}</span>
                  <span className={styles.writeDate}>{formatDate(post.created_at)}</span>
                </div>

                {/* 게시글 본문 및 첨부파일 */}
                <div className={styles.content}>
                  {post.thumbnail_url && (
                    <div style={{ marginBottom: "18px" }}>
                      <img
                        src={post.thumbnail_url}
                        alt="썸네일"
                        style={{ maxWidth: "320px", width: "100%", borderRadius: "11px", display: "block" }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  {post.content}

                  {/* 첨부 이미지 또는 비디오 출력 */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className={styles.attachmentGallery}>
                      {post.attachments.map((fileObj, idx) => {
                        const fileUrl = fileObj.file;
                        if (!fileUrl) return null;
                        const isVideo = fileUrl.endsWith('.mp4') || fileUrl.includes('video');
                        return (
                          <div key={idx} className={styles.mediaItem} style={{ marginTop: '16px' }}>
                            {isVideo ? (
                              <video src={fileUrl} controls width="320" />
                            ) : (
                              <img src={fileUrl} alt={`첨부파일-${idx}`} width="320" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 추천 / 비추천 버튼 */}
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
                    비추천 {post.dislike_count}
                  </button>
                </div>

                {/* 수정 / 삭제 버튼 (작성자만) */}
                {isLoggedIn && username && (username === (post.user?.username || post.user)) && (
                  <div className={styles.postActions}>
                    <button onClick={() => navigate(`/community/edit/${post.id}`)}>수정</button>
                    <button onClick={handlePostDelete}>삭제</button>
                  </div>
                )}

                {/* 댓글 영역 */}
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

                  {/* 댓글 목록 */}
                  <div className={styles.commentList}>
                    {comments.map(comment => {
                      const isBest = bestCommentIds.includes(comment.id);
                      return (
                        <div
                          key={comment.id}
                          className={`${styles.commentItem}${isBest ? ` ${styles.best}` : ''}`}
                        >
                          <div className={styles.commentHead}>
                            {isBest && <span className={styles.bestBadge}>BEST</span>}
                            <span className={styles.commentUser}>{comment.user}</span>
                            <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
                          </div>
                          <div className={styles.commentBody}>{comment.content}</div>
                          <div className={styles.commentActions}>
                            <button
                              className={comment.my_like === true ? "active" : ""}
                              onClick={() => handleCommentLike(comment.id, true)}
                              disabled={!isLoggedIn}
                            >
                              👍 {comment.like_count ?? 0}
                            </button>
                            <button
                              className={comment.my_like === false ? "active" : ""}
                              onClick={() => handleCommentLike(comment.id, false)}
                              disabled={!isLoggedIn}
                            >
                              👎 {comment.dislike_count ?? 0}
                            </button>
                            {isLoggedIn && username === comment.user && (
                              <button onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 관련 게시글 미리보기 */}
                <div style={{ marginTop: 46 }}>
                  <div style={{
                    fontWeight: 900, fontSize: '1.13rem', color: '#53a7ff',
                    marginBottom: 18, paddingLeft: 42
                  }}>
                    {(post.category_name || post.category)} 게시판의 최신글
                  </div>
                  <div className="post-list pro" style={{ marginBottom: 8 }}>
                    {relatedPosts.length === 0
                      ? <p className="no-post">관련 게시글이 없습니다.</p>
                      : relatedPosts.map(rp => (
                        <div
                          key={rp.id}
                          className="post-card pro"
                          onClick={() => handleRelatedPostClick(rp.id)}
                        >
                          {/* 썸네일 */}
                          <div className="post-thumb">
                            {rp.thumbnail_url ? (
                              <img
                                src={rp.thumbnail_url.startsWith('http') ? rp.thumbnail_url : `http://localhost:8000${rp.thumbnail_url}`}
                                alt="썸네일"
                                className="post-thumb-img"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="post-thumb-icon">문서</div>
                            )}
                          </div>

                          {/* 게시글 정보 */}
                          <div className="post-content-wrap">
                            <div className="post-title-row">
                              <span className="post-category">[{rp.category_name}]</span>
                              <h3 className="post-title">{rp.title}</h3>
                            </div>
                            <div className="post-meta-row">
                              <span className="post-user">{rp.user?.username || rp.user}</span>
                              <span className="post-date">{formatDate(rp.created_at)}</span>
                            </div>
                            <div className="post-stats-row">
                              <span className="stat"><FaThumbsUp className="icon like" /> {rp.like_count}</span>
                              <span className="stat"><FaThumbsDown className="icon dislike" /> {rp.dislike_count}</span>
                              <span className="stat"><FaComment className="icon comment" /> {rp.comment_count}</span>
                              <span className="stat"><FaEye className="icon view" /> {rp.view_count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* 우측 광고 영역 */}
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