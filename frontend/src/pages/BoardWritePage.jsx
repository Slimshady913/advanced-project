import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './BoardWritePage.css';

const categories = ['자유', '국내 드라마', '해외 드라마', '국내 영화', '해외 영화'];

function BoardWritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !content) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(
        '/api/boards/',
        { title, content, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/community');
    } catch (err) {
      setError('게시글 작성 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="write-container">
      <h1>게시글 작성</h1>
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

        <button type="submit">작성 완료</button>
      </form>
    </div>
  );
}

export default BoardWritePage;