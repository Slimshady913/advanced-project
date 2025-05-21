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

  // 최초 카테고리 목록 불러오기
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      setCategories(res.data);
    });
  }, []);

  // 현재 선택된 카테고리 id (없으면 첫 번째 카테고리 id, 없으면 빈 문자열)
  const currentCategory =
    category ||
    (categories.length > 0 ? String(categories[0].id) : '');

  // 게시글 목록 불러오기
  useEffect(() => {
    if (!currentCategory) return; // 카테고리 로딩 전엔 요청 안함
    const fetchPosts = async () => {
      try {
        let url = `/board/posts/?category=${currentCategory}`;
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

  // 카테고리 버튼 클릭시 URL 이동
  const handleCategoryClick = catId => {
    navigate(`/community/${catId}`);
  };

  // 게시글 클릭시 상세 페이지로 이동
  const handlePostClick = postId => {
    navigate(`/community/${currentCategory}/${postId}`);
  };

  const isLoggedIn = !!localStorage.getItem('access');

  // 글쓰기 시 현재 카테고리 전달(선택)
  const handleWriteClick = () => {
    navigate(`/community/write?category=${encodeURIComponent(currentCategory)}`);
  };

  return (
    <div className="board-container">
      <h1 className="board-title">커뮤니티</h1>
      <div className="category-tabs">
        {categories.map(cat => (
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