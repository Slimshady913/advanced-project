import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye, FaImage } from 'react-icons/fa';

function BoardListPage() {
  const { category: categorySlug } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  const saleCategory = categories.find(cat => cat.slug === 'sale');
  const customTabs = [
    { slug: 'hot', name: '인기' },
    ...categories.map(cat => ({ slug: cat.slug, name: cat.name, id: cat.id })),
    ...(saleCategory ? [] : [{ slug: 'sale', name: '핫딜' }]),
  ];

  const currentSlug =
    categorySlug ||
    (customTabs.length > 0 ? customTabs[0].slug : 'hot');

  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    if (!currentSlug) return;
    const fetchPosts = async () => {
      try {
        let url = `/board/posts/`;
        if (currentSlug === 'hot') {
          url += '?ordering=like_count';
        } else {
          url += `?category=${currentSlug}`;
        }
        const res = await axios.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error('게시글 목록 조회 실패', err);
        setPosts([]);
      }
    };
    fetchPosts();
    // eslint-disable-next-line
  }, [currentSlug, categories]);

  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  const handlePostClick = postId => {
    navigate(`/community/${currentSlug}/${postId}`);
  };

  const isLoggedIn = !!localStorage.getItem('access');

  const handleWriteClick = () => {
    navigate(`/community/write?category=${encodeURIComponent(currentSlug)}`);
  };

  return (
    <div className="board-root-layout">
      {/* 광고+본문 전체를 중앙에 한 덩어리로 */}
      <div className="board-center-wrap">
        {/* 왼쪽 광고: 여러 개, 짧은 배너, 고정 광고 */}
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
            <div className="category-tabs pro">
              {customTabs.map(cat => (
                <button
                  key={cat.slug}
                  className={currentSlug === cat.slug ? 'active' : ''}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {isLoggedIn && (
              <button className="write-button pro" onClick={handleWriteClick}>
                글쓰기
              </button>
            )}
            <div className="post-list pro">
              {posts.length === 0 ? (
                <p className="no-post">게시글이 없습니다.</p>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    className="post-card pro"
                    onClick={() => handlePostClick(post.id)}
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
                        <div className="post-thumb-icon">
                          <FaImage />
                        </div>
                      )}
                    </div>
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
                ))
              )}
            </div>
          </div>
        </main>
        {/* 오른쪽 광고: 여러 개, 고정 */}
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