import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardWritePage.css'; // 수정 폼에도 write 스타일이 더 어울림

function BoardEditPage() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); // 카테고리 id
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 카테고리 불러오기 + 게시글 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get('/board/categories/');
      setCategories(res.data);
    };
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/board/posts/${id}/`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setCategory(res.data.category); // id로 반환됨
      } catch (err) {
        setError('게시글 정보를 불러오지 못했습니다.');
      }
    };
    fetchCategories();
    fetchPost();
  }, [id]);

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
        { title, content, category }, // category는 id
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/community/${category}/${id}`);
    } catch (err) {
      setError('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="write-container">
      <h1>게시글 수정</h1>
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
        <button type="submit">수정 완료</button>
      </form>
    </div>
  );
}

export default BoardEditPage;