import React, { useState, useEffect, useRef } from 'react';
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
  const [media, setMedia] = useState([]); // 첨부파일 리스트
  const [mediaPreview, setMediaPreview] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();

  // 쿼리스트링 category(slug)
  const params = new URLSearchParams(location.search);
  const categorySlugFromQuery = params.get('category');

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

  // 미리보기 생성
  useEffect(() => {
    // cleanup
    mediaPreview.forEach(url => URL.revokeObjectURL(url));
    setMediaPreview(media.map(file => URL.createObjectURL(file)));
    // eslint-disable-next-line
  }, [media]);

  // 파일 첨부 이벤트
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(files);
  };

  const handleRemoveFile = (idx) => {
    setMedia(prev => prev.filter((_, i) => i !== idx));
  };

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      media.forEach(file => formData.append('media', file)); // 여러 파일 지원 (백엔드 지원 필요)

      await axios.post(
        '/board/posts/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setTitle('');
      setContent('');
      setCategory(categories.length > 0 ? categories[0].id : '');
      setMedia([]);
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
    <div className="write-bg">
      <div className="write-container card-elevate">
        <h1 className="write-title">게시글 작성</h1>
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
            rows={6}
          />
          {/* 파일 첨부 */}
          <label className="media-label">이미지 / GIF / 동영상 첨부</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input"
            id="file-input"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="media-upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            파일 선택
          </button>
          {/* 첨부 미리보기 */}
          <div className="media-preview-wrap">
            {media.map((file, idx) => {
              const url = mediaPreview[idx];
              if (!url) return null;
              // 이미지 또는 동영상 구분
              return file.type.startsWith('video') ? (
                <div className="media-preview-item" key={idx}>
                  <video src={url} controls width={120} />
                  <button type="button" onClick={() => handleRemoveFile(idx)} className="remove-btn">×</button>
                </div>
              ) : (
                <div className="media-preview-item" key={idx}>
                  <img src={url} alt="첨부 미리보기" width={120} />
                  <button type="button" onClick={() => handleRemoveFile(idx)} className="remove-btn">×</button>
                </div>
              );
            })}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">작성 완료</button>
        </form>
      </div>
    </div>
  );
}

export default BoardWritePage;