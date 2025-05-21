import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './BoardWritePage.css';

function BoardWritePage() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 카테고리 목록 불러오기
    axios.get('/board/categories/').then(res => {
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0].id); // 기본값 첫 카테고리
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !content) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    try {
      const token = localStorage.getItem('access');
      await axios.post(
        '/board/posts/',
        { title, content, category }, // category: id
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTitle('');
      setContent('');
      setCategory(categories.length > 0 ? categories[0].id : '');
      navigate('/community');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('게시글 작성 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="write-container">
      <h1>게시글 작성</h1>
      <form onSubmit={handleSubmit} className="write-form">
        <label>카테고리</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
        />
        <label>내용</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">작성 완료</button>
      </form>
    </div>
  );
}

export default BoardWritePage;