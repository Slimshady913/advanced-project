import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye, FaImage, FaSearch } from 'react-icons/fa';

/**
 * 커뮤니티 게시글 목록 페이지
 * - App에서 isLoggedIn, username을 props로 전달받음
 */
function BoardListPage({ isLoggedIn, username }) {
  const { category: categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 상태
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchType, setSearchType] = useState('title');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // URL 쿼리 파싱 (새로고침시 page/search 유지)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page') || '1', 10);
    setPage(pageParam);

    const typeParam = params.get('search_type') || 'title';
    setSearchType(typeParam);
    setSearchInput(params.get('search') || '');
    setSearch(params.get('search') || '');
    // eslint-disable-next-line
  }, [location.search]);

  // 카테고리 불러오기
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const data = Array.isArray(res.data) ? res.data
                : (Array.isArray(res.data.results) ? res.data.results : []);
      setCategories(data);
    });
  }, []);

  // 게시글 목록 불러오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let url = `/board/posts/?`;

    if (categorySlug) url += `category=${categorySlug}&`;
    if (params.get('page')) url += `page=${params.get('page')}&`;
    if (params.get('search_type')) url += `search_type=${params.get('search_type')}&`;
    if (params.get('search')) url += `search=${params.get('search')}&`;

    setLoading(true);
    axios.get(url)
      .then(res => {
        setPosts(res.data.results || []);
        setCount(res.data.count || 0);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setCount(0);
        setLoading(false);
      });
  }, [categorySlug, location.search]);

  // 카테고리/탭 데이터 방어
  const categoriesArr = Array.isArray(categories) ? categories : [];
  const saleCategory = categoriesArr.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categoriesArr.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];

  // 카테고리 변경
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 글쓰기
  const handleWriteClick = () => {
    navigate(`/community/write?category=${encodeURIComponent(categorySlug || 'hot')}`);
  };

  // 게시글 상세 이동
  const handlePostClick = postId => {
    navigate(`/community/${categorySlug || 'hot'}/${postId}`);
  };

  // 검색 실행
  const handleSearch = (e) => {
    e && e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) {
      params.set('search_type', searchType);
      params.set('search', searchInput);
    }
    params.set('page', '1');
    navigate(`/community/${categorySlug || 'hot'}?${params.toString()}`);
  };

  // 페이지네이션
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const pageArr = [];
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pageArr.push(i);

  const handlePageChange = p => {
    const params = new URLSearchParams(location.search);
    params.set('page', p);
    navigate(`/community/${categorySlug || 'hot'}?${params.toString()}`);
  };

  // "hot"이거나 카테고리 선택 안 된 경우 글쓰기 숨김
  const isWriteButtonVisible = !!categorySlug && categorySlug !== 'hot';

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
        <main className="board-center">
          <div className="board-container pro">
            <h1 className="board-title pro">커뮤니티</h1>
            {/* 탭 */}
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
            {/* ✅ 검색바 + 글쓰기 한 줄 배치 */}
            <div className="search-write-row">
              <form className="board-search-bar" onSubmit={handleSearch}>
                <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                  <option value="title">제목</option>
                  <option value="title_content">제목+내용</option>
                  <option value="user">작성자</option>
                </select>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="검색어 입력"
                />
                <button type="submit" className="search-btn">
                  <FaSearch />
                </button>
              </form>
              {isWriteButtonVisible && (
                <button
                  className="write-button pro"
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate('/auth');
                    } else {
                      handleWriteClick();
                    }
                  }}
                >
                  글쓰기
                </button>
              )}
            </div>
            {/* 게시글 목록 */}
            <div className="post-list pro">
              {loading ? (
                <p className="no-post">로딩중...</p>
              ) : posts.length === 0 ? (
                <p className="no-post">게시글이 없습니다.</p>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    className="post-card pro"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {/* 썸네일 */}
                    <div className="post-thumb">
                      {post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt="썸네일"
                          className="post-thumb-img"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="post-thumb-icon">📄</div>
                      )}
                    </div>
                    {/* 내용 전체 래핑 */}
                    <div className="post-content-wrap">
                      <div className="post-title-row">
                        <span className="post-category">[{post.category_name}]</span>
                        <h3 className="post-title">{post.title}</h3>
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
                          <FaComment className="icon comment" /> {post.comment_count}
                        </span>
                        <span className="stat">
                          <FaEye className="icon view" /> {post.view_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* 페이지네이션: 게시글 없을 때도 항상 표시 */}
            <nav className="pagination-bar" style={{marginTop: totalPages > 1 || count === 0 ? '30px' : '0'}}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                &lt;&lt;
              </button>
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                &lt;
              </button>
              {pageArr.map(p => (
                <button
                  key={p}
                  className={page === p ? 'active' : ''}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                &gt;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
              >
                &gt;&gt;
              </button>
            </nav>
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

export default BoardListPage;