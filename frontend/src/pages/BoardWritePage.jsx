import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios'; // 커스텀 axios 인스턴스
import { useNavigate, useLocation } from 'react-router-dom';
import './BoardWritePage.css'; // CSS 스타일링
import { validatePostInput } from '../utils/validatePost'; // 입력 유효성 검사 유틸

function BoardWritePage() {
  // 상태 선언
  const [categories, setCategories] = useState([]); // 전체 카테고리 목록
  const [category, setCategory] = useState('');     // 선택된 카테고리 ID
  const [title, setTitle] = useState('');           // 게시글 제목
  const [content, setContent] = useState('');       // 게시글 본문
  const [error, setError] = useState('');           // 에러 메시지
  const [media, setMedia] = useState([]);           // 첨부 파일 목록
  const [mediaPreview, setMediaPreview] = useState([]); // 첨부파일 미리보기 URL

  const navigate = useNavigate(); // 페이지 이동 훅
  const location = useLocation(); // 현재 URL 정보 가져오기
  const fileInputRef = useRef();  // 파일 input DOM 참조

  // URL 쿼리스트링에서 category(slug) 값 가져오기
  const params = new URLSearchParams(location.search);
  const categorySlugFromQuery = params.get('category');

  // 컴포넌트 마운트 시 카테고리 목록 요청 및 초기 선택값 설정
  useEffect(() => {
    axios.get('/board/categories/').then(res => {
      const categoriesArr =
        Array.isArray(res.data) ? res.data
        : Array.isArray(res.data.results) ? res.data.results
        : [];

      setCategories(categoriesArr);

      // 쿼리스트링에 category slug가 있으면 해당 카테고리 선택
      if (categorySlugFromQuery) {
        const matched = categoriesArr.find(cat => cat.slug === categorySlugFromQuery);
        if (matched) {
          setCategory(matched.id);
          return;
        }
      }

      // 기본값: 첫 번째 카테고리 선택
      if (categoriesArr.length > 0) setCategory(categoriesArr[0].id);
    });
    // eslint-disable-next-line
  }, []);

  // media 변경 시 미리보기 URL 생성 및 이전 URL 해제
  useEffect(() => {
    mediaPreview.forEach(url => URL.revokeObjectURL(url)); // 메모리 누수 방지
    setMediaPreview(media.map(file => URL.createObjectURL(file))); // 새 미리보기 URL 생성
    // eslint-disable-next-line
  }, [media]);

  // 파일 첨부 이벤트 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(files);
  };

  // 특정 첨부파일 제거
  const handleRemoveFile = (idx) => {
    setMedia(prev => prev.filter((_, i) => i !== idx));
  };

  // 게시글 작성 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 방지
    setError('');

    // 입력값 유효성 검사
    const validation = validatePostInput({ title, content });
    if (validation) {
      setError(validation);
      return;
    }

    try {
      // FormData를 이용한 multipart/form-data 전송
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      media.forEach(file => formData.append('media', file)); // 다중 파일 전송

      // 인증은 쿠키 기반, Authorization 헤더 제거
      await axios.post(
        '/board/posts/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // 작성 후 폼 초기화 및 커뮤니티 페이지로 이동
      setTitle('');
      setContent('');
      setCategory(categories.length > 0 ? categories[0].id : '');
      setMedia([]);
      navigate('/community');
    } catch (err) {
      // 에러 메시지 처리
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('게시글 작성 중 오류가 발생했습니다.');
      }
    }
  };

  // JSX 반환
  return (
    <div className="write-bg">
      <div className="write-container card-elevate">
        <h1 className="write-title">게시글 작성</h1>
        <form onSubmit={handleSubmit} className="write-form">
          {/* 카테고리 선택 */}
          <label>카테고리</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
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

          {/* 내용 입력 */}
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

          {/* 미리보기 출력 */}
          <div className="media-preview-wrap">
            {media.map((file, idx) => {
              const url = mediaPreview[idx];
              if (!url) return null;

              // 파일 유형에 따라 이미지 또는 동영상으로 렌더링
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

          {/* 에러 메시지 출력 */}
          {error && <p className="error-message">{error}</p>}

          {/* 제출 버튼 */}
          <button type="submit" className="submit-btn">작성 완료</button>
        </form>
      </div>
    </div>
  );
}

export default BoardWritePage;