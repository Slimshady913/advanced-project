import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';

function BoardListPage() {
  const { category: categorySlug } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  // "인기" "핫딜" 가상 탭
  const customTabs = [
    { id: 'hot', name: '인기', slug: 'hot' },
    { id: 'sale', name: '핫딜', slug: 'sale' },
    // 실제 카테고리도 slug 필드 필요! (ex: { id: 1, name: '자유', slug: 'free' })
    ...categories,
  ];

  // URL에 없으면 hot으로 기본값 (최초 진입)
  const currentSlug =
    categorySlug ||
    (customTabs.length > 0 ? customTabs[0].slug : 'hot');

  // 카테고리 목록 불러오기 (slug 필드 포함되어야 함!)
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      setCategories(res.data); // res.data: [{id, name, slug}, ...]
    });
  }, []);

  // 게시글 목록 불러오기 (slug에 따라 동작)
  useEffect(() => {
    if (!currentSlug) return;
    const fetchPosts = async () => {
      try {
        let url = `/board/posts/`;
        if (currentSlug === 'hot') {
          url += '?ordering=like_count';
        } else if (currentSlug === 'sale') {
          // 실제 "핫딜" 카테고리의 id 찾아서 적용
          const saleCat = categories.find(cat => cat.slug === 'sale');
          if (saleCat) {
            url += `?category=${saleCat.id}`;
          }
        } else {
          // 실제 카테고리 (자유, 국내 드라마 등)
          const selectedCat = categories.find(cat => cat.slug === currentSlug);
          if (selectedCat) {
            url += `?category=${selectedCat.id}`;
          }
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

  // 카테고리 버튼 클릭
  const handleCategoryClick = slug => {
    navigate(`/community/${slug}`);
  };

  // 게시글 클릭
  const handlePostClick = postId => {
    navigate(`/community/${currentSlug}/${postId}`);
  };

  const isLoggedIn = !!localStorage.getItem('access');

  // 글쓰기 (카테고리 slug로 전달)
  const handleWriteClick = () => {
    navigate(`/community/write?category=${encodeURIComponent(currentSlug)}`);
  };

  return (
    <div className="board-container">
      <h1 className="board-title">커뮤니티</h1>
      <div className="category-tabs">
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
        <button className="write-button" onClick={handleWriteClick}>
          글쓰기
        </button>
      )}
      <div className="post-list">
        {posts.length === 0 ? (
          <p>게시글이 없습니다.</p>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => handlePostClick(post.id)}
            >
              <h3>{post.title}</h3>
              <p>작성자: {post.user?.username || post.user}</p>
              <p>{formatDate(post.created_at)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BoardListPage;