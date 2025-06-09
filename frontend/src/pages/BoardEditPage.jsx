import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BoardWritePage.css';
import { validatePostInput } from '../utils/validatePost';

function BoardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  // 게시글 입력 필드 상태
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  // 미디어 관련 상태
  const [existingMedia, setExistingMedia] = useState([]); // 기존 첨부파일
  const [deletedMediaIds, setDeletedMediaIds] = useState([]); // 삭제된 파일 ID
  const [newMedia, setNewMedia] = useState([]); // 새로 추가된 파일
  const [newMediaPreview, setNewMediaPreview] = useState([]); // 새 파일의 미리보기 URL

  // 카테고리 및 게시글 데이터 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/board/categories/');
        const data = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data.results) ? res.data.results : []);
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
      } catch {
        setError('게시글 정보를 불러오지 못했습니다.');
      }
    };

    fetchCategories();
    fetchPost();
  }, [id]);

  // 새로 추가된 미디어에 대한 미리보기 URL 생성 및 정리
  useEffect(() => {
    newMediaPreview.forEach(url => URL.revokeObjectURL(url));
    setNewMediaPreview(newMedia.map(file => URL.createObjectURL(file)));
  }, [newMedia]);

  // 새 파일 선택 시 처리
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewMedia(files);
  };

  // 새로 선택된 파일 미리보기 제거
  const handleRemoveNewFile = (idx) => {
    setNewMedia(prev => prev.filter((_, i) => i !== idx));
  };

  // 기존 업로드된 파일 제거 (삭제 목록에 추가)
  const handleRemoveExistingFile = (id) => {
    setDeletedMediaIds(prev => [...prev, id]);
    setExistingMedia(prev => prev.filter(file => file.id !== id));
  };

  // 게시글 수정 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
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

      // 게시글 수정 요청
      await axios.put(`/board/posts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 수정 후 상세 페이지로 이동
      const selectedCategory = categories.find(cat => cat.id === Number(category));
      const slug = selectedCategory?.slug || 'free';
      navigate(`/community/${slug}/${id}`);
    } catch {
      setError('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="write-bg">
      <div className="write-container card-elevate">
        <h1 className="write-title">게시글 수정</h1>
        <form onSubmit={handleSubmit} className="write-form">
          {/* 카테고리 선택 */}
          <label>카테고리</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* 제목 입력 */}
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />

          {/* 본문 입력 */}
          <label>내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={6}
          />

          {/* 기존 첨부파일 목록 */}
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
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingFile(file.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* 새 파일 추가 */}
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

          {/* 새 파일 미리보기 */}
          <div className="media-preview-wrap">
            {newMedia.map((file, idx) => {
              const url = newMediaPreview[idx];
              if (!url) return null;
              const isVideo = file.type.startsWith('video');
              return (
                <div className="media-preview-item" key={idx}>
                  {isVideo
                    ? <video src={url} controls width={120} />
                    : <img src={url} alt="미리보기" width={120} />}
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* 에러 메시지 출력 */}
          {error && <p className="error-message">{error}</p>}

          {/* 수정 완료 버튼 */}
          <button type="submit" className="submit-btn">수정 완료</button>
        </form>
      </div>
    </div>
  );
}

export default BoardEditPage;