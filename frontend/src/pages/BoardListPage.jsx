import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardListPage.css';

// 카테고리 목록 (핫딜 추가, 인기 포함)
const categories = [
  { label: '자유', value: '자유' },
  { label: '국내 드라마', value: '국내 드라마' },
  { label: '해외 드라마', value: '해외 드라마' },
  { label: '국내 영화', value: '국내 영화' },
  { label: '해외 영화', value: '해외 영화' },
  { label: '핫딜', value: '핫딜' },
  { label: '인기 게시판', value: '인기' },
];

function BoardListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const currentCategory = category || '자유'; // 기본값

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [currentCategory]);

  const fetchPosts = async () => {
    try {
      let url = `/board/posts/`;
      // 인기 게시판은 정렬 기준 적용 (like_count)
      if (currentCategory === '인기') {
        url += '?ordering=like_count';
      } else {
        url += `?category=${encodeURIComponent(currentCategory)}`;
      }
      const res = await axios.get(url);
      setPosts(res.data);
    } catch (err) {
      console.error('게시글 목록 조회 실패', err);
      setPosts([]); // 오류시 비움
    }
  };

  // 카테고리 버튼 클릭시 URL 이동
  const handleCategoryClick = (cat) => {
    navigate(`/community/${cat}`);
  };

  // 게시글 클릭시 상세 페이지로 이동
  const handlePostClick = (postId) => {
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
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={currentCategory === cat.value ? 'active' : ''}
            onClick={() => handleCategoryClick(cat.value)}
          >
            {cat.label}
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
          posts.map((post) => (
            <div key={post.id} className="post-card" onClick={() => handlePostClick(post.id)}>
              <h3>{post.title}</h3>
              <p>작성자: {post.user.username || post.user}</p>
              <p>{post.created_at?.slice(0, 10)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BoardListPage;