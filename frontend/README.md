# 🎨 Frontend - React

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![Style](https://img.shields.io/badge/Style-Netflix--Inspired-black)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

> 넷플릭스 스타일 UI를 기반으로 사용자 인증, 영화 리뷰 작성, 게시판 등 기능을 제공하는 React 프론트엔드입니다.

---

## 📑 목차

- [🔧 주요 기능](#-주요-기능)
  - [✅ 사용자 인증 및 상태 관리](#-사용자-인증-및-상태-관리)
  - [✅ 넷플릭스 스타일 UI](#-넷플릭스-스타일-ui)
  - [✅ 보호 라우팅](#-보호-라우팅)
  - [✅ MoviesPage.jsx 기능](#-moviespagejsx-기능)
  - [✅ MovieDetailPage.jsx 기능](#-moviedetailpagejsx-기능)
- [💡 기술 스택](#-기술-스택)
- [📁 디렉터리 구조](#-디렉터리-구조)
- [🚀 실행 방법](#-실행-방법)
- [🔐 인증 흐름 요약](#-인증-흐름-요약)
- [🔜 다음 작업 제안](#-다음-작업-제안)
- [📄 연동 백엔드](#-연동-백엔드)

---

## 🔧 주요 기능

### ✅ 사용자 인증 및 상태 관리
- JWT 기반 로그인 / 회원가입 구현
- `localStorage`에 `accessToken` 저장하여 로그인 상태 유지
- 로그인 성공 시 Header에 사용자 이메일 표시
- 로그아웃 시 상태 초기화 및 토큰 삭제
- 회원가입 시 자동 로그인 구현 완료
- 로그인/회원가입 중 전체 화면 로딩 스피너 적용 

### ✅ 회원 정보 페이지
- 프로필 조회 후 닉네임, 구독 OTT 수정 가능
- 저장 시 Header의 닉네임도 자동 갱신
- 저장 성공 메시지 표시
- 초기 로딩 시 스피너 표시로 깜빡임 제거



### ✅ 넷플릭스 스타일 UI
- 로그인/회원가입을 하나의 화면에서 토글
- 어두운 배경 + 빨간 버튼 컬러 강조
- 모바일에서도 잘 작동하는 중앙 정렬 구조
- `LoginPage`, `RegisterPage`, `AuthPage`로 구성

### ✅ 보호 라우팅
- 로그인하지 않은 사용자가 접근 시 `/auth`로 리디렉션
- `PrivateRoute.jsx`를 통한 경로 보호 구현
- 예시: `/`, `/reviews`는 로그인한 사용자만 접근 가능

### ✅ MoviesPage.jsx 기능
- 영화 목록 조회: `/api/movies/search/` API와 연동
- 검색창 (제목): 실시간 필터링
- OTT 필터: `/api/ott/`에서 OTT 목록 불러와 동적 필터
- 정렬 옵션: 최신순 / 평점순 / 제목순 등
- 영화 카드 클릭 시 상세 페이지 이동 (`useNavigate` 사용)
- OTT 로고 표시: `ott_services` ID 기반 매핑 후 로고 렌더링
-  “구독 중인 OTT” 필터 (드롭다운 내 로그인 사용자 전용 옵션)
- 스타일: JustWatch 스타일 참고 + Netflix 카드 레이아웃 기반
- 유지보수: `MoviesPage.css`에 별도 스타일 정리

### ✅ MovieDetailPage.jsx 기능
- 영화 ID 기반 상세 조회: `/api/movies/:id/` API 연동
- 썸네일, 제목, 설명, 출시일, OTT 로고 표시
- 평균 평점: 별점 형태로 시각화
- 리뷰 목록 표시
  - 리뷰 작성 / 수정 / 삭제 기능
  - 리뷰 좋아요(추천) 기능
  - 리뷰 수정 시 `(수정됨)` 표시
  - 리뷰 정렬: 최신순 / 평점순 / 추천순 정렬 지원
  - 추천수 상위 3개 리뷰 자동 강조 (Top 3)
  - 리뷰 이미지 업로드 지원 (다중 이미지 첨부)
- 리뷰 댓글 표시
  - 댓글 작성 / 삭제 기능
  - 댓글 추천(좋아요) 기능
  - 추천순 정렬 시 상위 3개 댓글 우선 표시
- 스타일 유지보수: `MovieDetailPage.css`에 별도 스타일 정리

### ✅ 커뮤니티 기능 (Board)

#### 📄 BoardListPage.jsx
- 게시글 목록 조회: `/board/posts/` API 연동
- 카테고리 탭 구현: 자유, 국내/해외 드라마/영화, 인기 게시판
- `category` 쿼리 파라미터로 필터링 처리
- 게시글 카드 클릭 시 상세 페이지(`/community/:id`)로 이동
- 로그인 사용자만 '글쓰기' 버튼 표시
- 스타일 유지보수: `BoardListPage.css`에 정리 (Netflix 스타일 + 밝은 배경 구조 반영)

#### 📝 BoardWritePage.jsx
- 게시글 작성 폼 구현: 제목, 내용, 카테고리 입력
- 게시글 작성 요청: `POST /board/posts/`
- 작성 완료 시 게시판 목록(`/community`)으로 리디렉션
- 로그인 사용자 전용 경로 (`/community/write`)
- 드롭다운으로 카테고리 선택 가능

#### 📑 BoardDetailPage.jsx
- 게시글 상세 조회: `GET /board/posts/:id/`
- 제목, 내용, 작성자, 작성일 출력
- 로그인한 작성자일 경우 ‘수정’/‘삭제’ 버튼 표시
- 댓글 목록 조회: `GET /board/posts/:id/comments/`
  - 추천수 상위 3개 + 작성순 댓글 정렬 혼합 구조
- 댓글 작성, 삭제, 추천(좋아요) 기능 구현
  - 작성: `POST /board/posts/:id/comments/`
  - 삭제: `DELETE /board/comments/:id/`
  - 추천: `POST /board/comments/:id/like/`
- 스타일: muko.kr 스타일 참고
  - 밝은 회색 배경(`#f9f9f9`), 어두운 텍스트(`#333`), 흰색 카드, 하늘색 버튼 유지

#### ✏️ BoardEditPage.jsx
- 기존 게시글 정보 불러오기: `GET /board/posts/:id/`
- 제목, 내용, 카테고리 수정 가능
- 수정 요청: `PUT /board/posts/:id/`
- 수정 완료 시 상세 페이지로 리디렉션
- 기존 값 자동 세팅, 카테고리 드롭다운 유지

---

## 💡 기술 스택

| 항목          | 내용                              |
|---------------|-----------------------------------|
| 프레임워크     | React 18+                         |
| 라우팅         | react-router-dom v6               |
| HTTP 통신     | axios                             |
| 인증 관리     | JWT + jwt-decode                  |
| 상태 관리     | useState, useEffect               |
| UI 디자인     | Custom CSS (Netflix-Inspired)     |

---

## 📁 디렉터리 구조

```
frontend/
├── public/
│ └── index.html
├── src/
│ ├── api/ # axios 인스턴스
│ │ └── axios.js
│ ├── components/ # Header 컴포넌트 등
│ │ └── Header.jsx
│ ├── pages/ # 페이지 구성
│ │ ├── AuthPage.jsx
│ │ ├── LoginPage.jsx
│ │ ├── RegisterPage.jsx
│ │ └── MovieDetailPage.jsx
│ ├── routes/ # 보호 라우트
│ │ └── PrivateRoute.jsx
│ ├── App.jsx # 전체 라우터 및 상태 관리
│ └── index.js # 앱 진입점
└── package.json # 종속성 관리
```

---

## 🚀 실행 방법

```bash
cd frontend
npm install
npm start
```

> 기본적으로 `http://localhost:3000`에서 앱이 실행됩니다.  
> `.env` 파일에서 API URL을 지정하지 않은 경우, `axios` 기본 경로는 `/api`로 설정되어 있어 `proxy` 설정을 통해 Django 백엔드와 연결됩니다.

---

## 🔐 인증 흐름 요약

1. `/auth`에서 로그인 또는 회원가입
2. 로그인 성공 시 JWT accessToken을 localStorage에 저장
3. Header에서 이메일 표시 및 보호 페이지 접근 허용
4. 로그아웃 시 토큰 제거 및 상태 초기화

---

### 🧩 주요 이슈 해결 내역

#### (2025-05-12)
- **API에서 image 호출 문제 해결**

#### (2025-05-07)
- **로그인 인증 문제 해결**

---

## 🧩 향후 구현 예정 기능

- 영화 상세 페이지 및 리뷰 목록/작성 기능
- 리뷰 수정/삭제 및 좋아요 기능
- 게시판 글쓰기 및 댓글 기능
- JWT refresh token 처리 (자동 갱신)
- 반응형 UI 개선 및 페이지 애니메이션 추가

---

## 📄 연동 백엔드

- [🛠 Django REST API 문서 보기](../backend/README.md)

---

### **추가된 내용**
1. **MoviesPage.jsx와 MovieDetailPage.jsx 기능 설명**:
   - 각 페이지의 주요 기능과 상태를 상세히 설명했습니다.
2. **다음 작업 제안**:
   - 앞으로 구현할 기능을 명확히 제안했습니다.
3. **디렉터리 구조**:
   - 프로젝트 구조를 명확히 정리했습니다.