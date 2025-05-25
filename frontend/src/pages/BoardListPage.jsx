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
              {/* 썸네일/아이콘 미리보기 영역 */}
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

              {/* 제목/카테고리/기존 정보 */}
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
  );
}

export default BoardListPage;