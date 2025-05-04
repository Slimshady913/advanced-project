# 🎬 영화 리뷰 플랫폼

> 사용자들이 영화를 검색하고, 리뷰를 작성하고, 커뮤니티에서 토론할 수 있는 웹 애플리케이션입니다.

---

## 🔧 주요 기능

### ✅ 사용자 기능
- JWT 기반 회원가입 및 로그인
- 프로필 조회 및 OTT 구독 설정
- 토큰 기반 인증 시스템

### ✅ 영화 기능
- 영화 등록, 목록 조회, 상세 보기, 수정/삭제
- 영화 정렬 기능 (평점, 개봉일, 제목 등)
- OTT 플랫폼과의 다대다 연결

### ✅ 리뷰 및 커뮤니티
- 영화별 리뷰 작성 및 조회
- 리뷰 평점(1~5점) 및 좋아요 기능
- 댓글 등록 및 삭제 (작성자만 삭제 가능)
- 리뷰별 평점 평균 자동 계산

### ✅ Swagger 문서화
- API 자동 문서화 (drf-yasg)
- 한글 설명 제공
- `/swagger/` 경로에서 테스트 가능

---

## 🗂 기술 스택

| 구분       | 기술 |
|------------|------|
| **Backend** | Django, Django REST Framework, SimpleJWT |
| **Frontend** | React (예정) |
| **DB**      | PostgreSQL or SQLite (개발 단계) |
| **Docs**    | Swagger (drf-yasg) |
| **Auth**    | JWT (Access/Refresh Token) |
| **DevOps**  | GitHub, Docker (예정) |

---

## 📁 프로젝트 구조 (백엔드 기준 예시)

```
backend/
├── config/                     # Django 프로젝트 설정 폴더
│   ├── settings.py             # 전체 설정
│   ├── urls.py                 # 전역 URL 라우팅
│   └── wsgi.py / asgi.py       # 배포용 설정
│
├── users/                      # 사용자 앱
│   ├── models.py               # 사용자 모델 (AbstractUser 확장 가능)
│   ├── views.py                # 회원가입, 프로필, 구독 API
│   ├── serializers.py
│   ├── urls.py
│   └── permissions.py
│
├── movies/                     # 영화 앱
│   ├── models.py               # 영화 + OTT ManyToMany
│   ├── views.py                # 조회, 등록, 정렬 등
│   ├── serializers.py
│   └── urls.py
│
├── reviews/                    # 리뷰 + 댓글 + 좋아요
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── permissions.py
│   └── urls.py
│
├── ott/                        # OTT 플랫폼 (넷플릭스 등)
│   ├── models.py
│   ├── serializers.py
│   └── urls.py
│
├── manage.py                   # Django 실행 파일
├── requirements.txt            # 패키지 목록
└── db.sqlite3 (또는 PostgreSQL 사용 가능)
```

---

## 🚀 실행 방법

### 1. 가상환경 설치 및 패키지 설치

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 마이그레이션 및 서버 실행

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### 3. Swagger 접속

```
http://localhost:8000/swagger/
```

---

## 🔐 JWT 인증 사용법 (Swagger에서)

1. `/api/token/`에서 access, refresh 토큰 발급
2. Swagger 우측 상단 Authorize 클릭
3. `Bearer <access_token>` 형식으로 입력 후 인증

---

## 🛠 향후 계획

- React 기반 프론트엔드 연동
- 관리자 페이지 커스터마이징
- Docker 배포 자동화

---

## 🙌 기여 방법

1. 이 저장소를 fork 합니다.
2. 새로운 브랜치를 만듭니다 (`git checkout -b feature/my-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add my feature'`)
4. PR을 보냅니다!

---