import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './BoardListPage.css';

const categories = [
  { label: '자유', value: '자유' },
  { label: '국내 드라마', value: '국내 드라마' },
  { label: '해외 드라마', value: '해외 드라마' },
  { label: '국내 영화', value: '국내 영화' },
  { label: '해외 영화', value: '해외 영화' },
  { label: '인기 게시판', value: '인기' }, // '인기'는 별도 정렬 처리
];

function BoardListPage() {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('자유');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      console.log('📤 요청한 카테고리:', selectedCategory);
      const res = await axios.get(`/board/posts/?category=${selectedCategory}`);
      console.log('📥 응답 데이터:', res.data);
      setPosts(res.data);
    } catch (err) {
      console.error('게시글 목록 조회 실패', err);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const isLoggedIn = !!localStorage.getItem('accessToken');

  return (
    <div className="board-container">
      <h1 className="board-title">커뮤니티</h1>
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={selectedCategory === cat.value ? 'active' : ''}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoggedIn && (
        <button className="write-button" onClick={() => navigate('/community/write')}>
          글쓰기
        </button>
      )}

      <div className="post-list">
        {posts.length === 0 ? (
          <p>게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card" onClick={() => handlePostClick(post.id)}>
              <h3>{post.title}</h3>
              <p>작성자: {post.user.username}</p>
              <p>{post.created_at.slice(0, 10)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BoardListPage;