import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardWritePage.css';
import { validatePostInput } from '../utils/validatePost';

function BoardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const [existingMedia, setExistingMedia] = useState([]); // 기존 첨부파일
  const [deletedMediaIds, setDeletedMediaIds] = useState([]); // 삭제 대상
  const [newMedia, setNewMedia] = useState([]); // 새로 추가된 파일들
  const [newMediaPreview, setNewMediaPreview] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/board/categories/');
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.results) ? res.data.results : []);
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };

    const fetchPost = async () => {
      try {
        const res = await axios.get(`/board/posts/${id}/`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setCategory(res.data.category);
        setExistingMedia(res.data.attachments || []);
      } catch (err) {
        setError('게시글 정보를 불러오지 못했습니다.');
      }
    };

    fetchCategories();
    fetchPost();
  }, [id]);

  useEffect(() => {
    newMediaPreview.forEach(url => URL.revokeObjectURL(url));
    setNewMediaPreview(newMedia.map(file => URL.createObjectURL(file)));
  }, [newMedia]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewMedia(files);
  };

  const handleRemoveNewFile = (idx) => {
    setNewMedia(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingFile = (id) => {
    setDeletedMediaIds(prev => [...prev, id]);
    setExistingMedia(prev => prev.filter(file => file.id !== id));
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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      newMedia.forEach(file => formData.append('media', file));
      deletedMediaIds.forEach(id => formData.append('delete_attachments', id));

      await axios.put(`/board/posts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const selectedCategory = categories.find(cat => cat.id === Number(category));
      const slug = selectedCategory?.slug || 'free';
      navigate(`/community/${slug}/${id}`);
    } catch (err) {
      setError('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="write-bg">
      <div className="write-container card-elevate">
        <h1 className="write-title">게시글 수정</h1>
        <form onSubmit={handleSubmit} className="write-form">
          <label>카테고리</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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

          <label className="media-label">첨부된 파일</label>
          <div className="media-preview-wrap">
            {existingMedia.map(file => {
              const isVideo = file.file.endsWith('.mp4') || file.file.includes('video');
              return (
                <div className="media-preview-item" key={file.id}>
                  {isVideo ? (
                    <video src={file.file} controls width={120} />
                  ) : (
                    <img src={file.file} alt="첨부파일" width={120} />
                  )}
                  <button type="button" onClick={() => handleRemoveExistingFile(file.id)} className="remove-btn">×</button>
                </div>
              );
            })}
          </div>

          <label className="media-label">새 파일 추가</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="media-upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            파일 선택
          </button>

          <div className="media-preview-wrap">
            {newMedia.map((file, idx) => {
              const url = newMediaPreview[idx];
              if (!url) return null;
              const isVideo = file.type.startsWith('video');
              return (
                <div className="media-preview-item" key={idx}>
                  {isVideo ? <video src={url} controls width={120} /> : <img src={url} alt="미리보기" width={120} />}
                  <button type="button" onClick={() => handleRemoveNewFile(idx)} className="remove-btn">×</button>
                </div>
              );
            })}
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">수정 완료</button>
        </form>
      </div>
    </div>
  );
}

export default BoardEditPage;