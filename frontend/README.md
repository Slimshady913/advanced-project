# 🎨 Frontend - React

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![Style](https://img.shields.io/badge/Style-Netflix--Inspired-black)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

> 넷플릭스 스타일 UI를 기반으로 사용자 인증, 영화 리뷰, 커뮤니티 기능을 제공하는 React 프론트엔드입니다. Django REST 백엔드와 통신하며 JWT 인증, 보호 라우팅, 동적 필터링 UI 등을 구현하였습니다.

---

## 📑 목차

- [🔧 주요 기능](#-주요-기능)
- [🧭 라우팅 구조](#-라우팅-구조)
- [📁 디렉터리 구조](#-디렉터리-구조)
- [💡 기술 스택](#-기술-스택)
- [🚀 실행 방법](#-실행-방법)
- [🔐 인증 흐름 요약](#-인증-흐름-요약)
- [🧪 테스트 실행](#-테스트-실행)
- [🛠 환경 변수 설정 (.env)](#-환경-변수-설정-env)
- [📄 연동 백엔드](#-연동-백엔드)

---

## 🔧 주요 기능

### ✅ 사용자 인증 및 상태 관리
- JWT 기반 로그인 / 회원가입 구현
- Access Token을 `localStorage`에 저장하여 상태 유지
- 로그인 성공 시 Header에 사용자 이메일 표시
- 로그아웃 시 상태 초기화 및 토큰 삭제
- 회원가입 시 자동 로그인 구현 완료
- 자동 로그인 및 전체화면 로딩 스피너 적용
- 프로필 조회/수정 및 구독 OTT 설정

### ✅ 회원 정보 페이지
- 프로필 조회 후 닉네임, 구독 OTT 수정 가능
- 저장 시 Header의 닉네임도 자동 갱신
- 저장 성공 메시지 표시
- 초기 로딩 시 스피너 표시로 깜빡임 제거

### ✅ 넷플릭스 스타일 UI
- 어두운 배경 + 강렬한 버튼 컬러
- 로그인/회원가입 토글 UI (`AuthPage`)
- 모바일 반응형 대응 및 중앙 정렬 레이아웃

### ✅ 보호 라우팅
- 로그인하지 않은 사용자가 접근 시 `/auth`로 리디렉션
- `PrivateRoute.jsx`를 통한 경로 보호 구현
- 예시: `/`, `/reviews`는 로그인한 사용자만 접근 가능

### ✅ 영화 목록 페이지 (`MoviesPage.jsx`)
- 영화 목록 조회: `/api/movies/search/` API와 연동
- 검색창 (제목): 실시간 필터링
- OTT 필터: `/api/ott/`에서 OTT 목록 불러와 동적 필터
- 정렬 옵션: 최신순 / 평점순 / 제목순 등
- 영화 카드 클릭 시 상세 페이지 이동 (`useNavigate` 사용)
- OTT 로고 표시: `ott_services` ID 기반 매핑 후 로고 렌더링
-  “구독 중인 OTT” 필터 (드롭다운 내 로그인 사용자 전용 옵션)
- 스타일: JustWatch 스타일 참고 + Netflix 카드 레이아웃 기반
- 유지보수: `MoviesPage.css`에 별도 스타일 정리

### ✅ 영화 상세 페이지 (`MovieDetailPage.jsx`)
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
- 카테고리 탭 필터링 (`BoardListPage`)
- 게시글 상세 조회 + 댓글 (`BoardDetailPage`)
- 게시글 작성/수정 (`BoardWritePage`, `BoardEditPage`)
- 게시글/댓글 추천 기능, 밝은 배경 스타일

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

## 🧭 라우팅 구조

| 경로 | 설명 |
|------|------|
| `/auth` | 로그인/회원가입 페이지 |
| `/movies` | 전체 영화 목록 |
| `/movies/:id` | 영화 상세 |
| `/community` | 커뮤니티 목록 |
| `/community/:id` | 게시글 상세 |
| `/community/write` | 글쓰기 페이지 |
| `/community/edit/:id` | 게시글 수정 |
| `/profile` | 사용자 정보 수정 페이지 |
| `/subscribe` | OTT 선택 페이지 (회원가입 중) |

---

## 📁 디렉터리 구조

frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/               # Axios 인스턴스 및 인증 처리
│   │   └── axios.js
│   ├── components/        # 공통 UI 컴포넌트 (Header 등)
│   │   └── Header.jsx
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── AuthPage.jsx / LoginPage.jsx / RegisterPage.jsx
│   │   ├── MoviesPage.jsx / MovieDetailPage.jsx
│   │   ├── BoardListPage.jsx / BoardDetailPage.jsx / BoardWritePage.jsx / BoardEditPage.jsx
│   │   ├── ProfilePage.jsx / SubscribePage.jsx
│   │   └── 각 페이지별 *.css 또는 *.module.css
│   ├── routes/            # 보호 라우팅 컴포넌트
│   │   └── PrivateRoute.jsx
│   ├── utils/             # 유틸 함수 모음
│   │   ├── formatDate.js
│   │   └── validatePost.js
│   ├── App.jsx            # 전체 라우터 및 상태 초기화
│   ├── index.js           # React 진입점
│   └── index.css / App.css
├── package.json           # 종속성 관리
└── .env                   # 환경변수 설정 파일 (선택)

---

## 💡 기술 스택

| 항목           | 내용                                      |
|----------------|-------------------------------------------|
| 프레임워크      | React 18+                                 |
| 라우팅         | react-router-dom v6                       |
| HTTP 통신      | axios + interceptor 설정                  |
| 인증 관리      | JWT (accessToken 저장, 인증 헤더 설정)   |
| 상태 관리      | useState / useEffect 기반                 |
| 디자인         | Custom CSS + Netflix 스타일               |
| 반응형 대응     | CSS Flexbox + rem 단위 레이아웃           |

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

1. 로그인 시 Access Token을 localStorage에 저장
2. Axios 인스턴스에 자동으로 Authorization 헤더 삽입
3. 로그인 상태에 따라 PrivateRoute로 보호 경로 분기
4. 로그아웃 시 localStorage 초기화 및 리디렉션

---

## 🧪 테스트 실행

```bash
npm test
```

- App.test.js, setupTests.js 등 기본 테스트 환경 구축 완료

---

## 🛠 환경 변수 설정 (.env)

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```
- 또는 package.json에 "proxy": "http://localhost:8000" 설정으로 API 요청 프록시 가능

---

## 📄 연동 백엔드

- [🛠 Django REST API 문서 보기](../backend/README.md)

---

## 📌 향후 구현 예정 기능

- 게시판 기능 최적화
- 리뷰/댓글 알림 기능 추가
- 반응형 UI 세부 개선

---

### 🧩 주요 이슈 해결 내역

#### (2025-06-08)
- **커뮤니티 게시글 첨부 미디어 + 썸네일 미리보기 적용**

#### (2025-06-01)
- **MovieDetailPage 반응형 개선 및 스타일 최적화**

#### (2025-05-27)
- **로그인 후 자동 리디렉션 및 Toast 알림 적용**

#### (2025-05-16)
- **UI문제 해결(MoviesPage, MovieDetailPage)**

#### (2025-05-12)
- **API에서 image 호출 문제 해결**

#### (2025-05-07)
- **로그인 인증 문제 해결**

---

### **추가된 내용**
1. **MoviesPage.jsx와 MovieDetailPage.jsx 기능 설명**:
   - 각 페이지의 주요 기능과 상태를 상세히 설명했습니다.
2. **다음 작업 제안**:
   - 앞으로 구현할 기능을 명확히 제안했습니다.
3. **디렉터리 구조**:
   - 프로젝트 구조를 명확히 정리했습니다.