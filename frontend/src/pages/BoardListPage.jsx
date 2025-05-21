import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardListPage.css';
import { formatDate } from '../utils/formatDate';

function BoardListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);

  // 1. 카테고리 + "인기" 가상 탭 합치기
  const customTabs = [{ id: 'hot', name: '인기' }, ...categories];

  // 2. URL 파라미터/기본값 처리
  const currentCategory =
    category ||
    (customTabs.length > 0 ? String(customTabs[0].id) : '');

  // 3. 카테고리 불러오기
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      setCategories(res.data);
    });
  }, []);

  // 4. 게시글 목록 불러오기 (인기 vs 일반)
  useEffect(() => {
    if (!currentCategory) return;
    const fetchPosts = async () => {
      try {
        let url = `/board/posts/`;
        if (currentCategory === 'hot') {
          url += '?ordering=like_count';
        } else {
          url += `?category=${currentCategory}`;
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
  }, [currentCategory, categories]);

  // 5. 카테고리 버튼 클릭
  const handleCategoryClick = catId => {
    navigate(`/community/${catId}`);
  };

  // 6. 게시글 클릭
  const handlePostClick = postId => {
    navigate(`/community/${currentCategory}/${postId}`);
  };

  const isLoggedIn = !!localStorage.getItem('access');

  // 7. 글쓰기
  const handleWriteClick = () => {
    navigate(`/community/write?category=${encodeURIComponent(currentCategory)}`);
  };

  return (
    <div className="board-container">
      <h1 className="board-title">커뮤니티</h1>
      <div className="category-tabs">
        {customTabs.map(cat => (
          <button
            key={cat.id}
            className={currentCategory === String(cat.id) ? 'active' : ''}
            onClick={() => handleCategoryClick(cat.id)}
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