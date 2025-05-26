import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './BoardWritePage.css';
import { validatePostInput } from '../utils/validatePost';

function BoardWritePage() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 쿼리스트링에서 category(slug) 읽기
  const params = new URLSearchParams(location.search);
  const categorySlugFromQuery = params.get('category'); // 예: "movie_kr"

  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const categoriesArr =
        Array.isArray(res.data) ? res.data
          : Array.isArray(res.data.results) ? res.data.results
            : [];
      setCategories(categoriesArr);

      if (categorySlugFromQuery) {
        const matched = categoriesArr.find(cat => cat.slug === categorySlugFromQuery);
        if (matched) {
          setCategory(matched.id);
          return;
        }
      }
      if (categoriesArr.length > 0) setCategory(categoriesArr[0].id);
    });
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validation = validatePostInput({ title, content });
    if (validation) {
      setError(validation);
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