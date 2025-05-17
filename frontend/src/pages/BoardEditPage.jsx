import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import './BoardWritePage.css';

const categories = ['자유', '국내 드라마', '해외 드라마', '국내 영화', '해외 영화'];

function BoardEditPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`/board/posts/${id}/`);
      const post = res.data;
      setTitle(post.title);
      setContent(post.content);
      // category: 문자열 또는 { name: '...' } 형태 둘 다 대응
      setCategory(post.category.name || post.category);
    } catch (err) {
      console.error('게시글 불러오기 실패', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !content) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('access');
      await axios.put(
        `/board/posts/${id}/`,
        { title, content, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(`/community/${id}`);
    } catch (err) {
      console.error('게시글 수정 실패', err);
      setError('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="write-container">
      <h1>게시글 수정</h1>
      <form onSubmit={handleSubmit} className="write-form">
        <label>카테고리</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
        />

        <label>내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
        ></textarea>

        {error && <p className="error-message">{error}</p>}

        <button type="submit">수정 완료</button>
      </form>
    </div>
  );
}

export default BoardEditPage;